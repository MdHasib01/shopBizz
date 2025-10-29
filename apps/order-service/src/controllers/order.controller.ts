import { NotFoundError, ValidationError } from "@packages/errorHandler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { Prisma } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import Stripe from "stripe";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil" as any,
});

const generateOrderNumber = () =>
  `ORD-${Date.now()}-${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0")}`;

// create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;

  if (!sellerStripeAccountId) {
    return next(new ValidationError("Missing seller Stripe account"));
  }

  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.round(customerAmount * 0.1);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      // Ensure cross-border charges settle in the seller's account instead of the platform
      on_behalf_of: sellerStripeAccountId,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user?.id,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// create payment session
export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user?.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError("Cart is empty or invalid"));
    }

    // Build a normalized, stable representation of the incoming cart
    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: String(item.id),
          quantity: Number(item.quantity),
          sale_price: Number(item.sale_price),
          shopId: String(item.shopId),
          selectedOptions: item.selectedOptions ?? {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    // Look for an existing, equivalent session for this user in Redis
    const keys = await redis.keys("payment-session:*");

    for (const key of keys) {
      const data = await redis.get(key);
      if (!data) continue;

      const session = JSON.parse(data);

      if (session.userId === userId) {
        // Normalize the existing session's cart in exactly the same way
        const existingCart = JSON.stringify(
          (session.cart as any[])
            .map((item: any) => ({
              id: String(item.id),
              quantity: Number(item.quantity),
              sale_price: Number(item.sale_price),
              shopId: String(item.shopId),
              selectedOptions: item.selectedOptions ?? {},
            }))
            .sort((a, b) => a.id.localeCompare(b.id))
        );

        if (existingCart === normalizedCart) {
          const sessionId = key.replace("payment-session:", "");
          return res.json({ sessionId });
        }
      }
    }

    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop?.sellers?.stripeId,
    }));

    // Calculate total cart amount
    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.sale_price;
    }, 0);

    // Create session payload
    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );

    res.status(201).json({ sessionId });
  } catch (error) {
    return next(error);
  }
};

// verifying payment session
export const verifyingPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Fetch session from Redis
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    // Parse and return session
    const session = JSON.parse(sessionData);
    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];

    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rawBody = (req as any).rawBody;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      if (!userId) {
        console.warn(
          `Payment intent ${paymentIntent.id} is missing user metadata. Skipping order creation.`
        );
        return res.status(200).send("Missing user context");
      }

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn(`Session data expired or missing for ${sessionId}`);
        return res
          .status(200)
          .send("No session found, skipping order creation");
      }

      const { cart, shippingAddressId, coupon } = JSON.parse(sessionData);

      const normalizedUserId = String(userId);

      const user = await prisma.users.findUnique({
        where: { id: normalizedUserId },
        select: { name: true, email: true },
      });

      const name = user?.name || "";
      const email = user?.email || "";

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId of Object.keys(shopGrouped)) {
        const orderItems = shopGrouped[shopId];
        const orderSubtotal = orderItems.reduce(
          (total: number, item: any) => total + item.quantity * item.sale_price,
          0
        );
        let discountValue = 0;
        let orderTotal = orderSubtotal;
        // Apply discount if applicable
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;

            discountValue = discount;
            orderTotal = Math.max(orderSubtotal - discount, 0);
          }
        }

        // Create order
        await prisma.orders.create({
          data: {
            userId: normalizedUserId,
            orderBy: normalizedUserId,
            shopId: String(shopId),
            orderNumber: generateOrderNumber(),
            subtotal: orderSubtotal,
            discount: discountValue,
            total: orderTotal,
            currency: paymentIntent.currency
              ? paymentIntent.currency.toUpperCase()
              : "USD",
            status: "Paid",
            shippingAddressId: shippingAddressId
              ? String(shippingAddressId)
              : null,
            couponCode: coupon?.code || null,
            discountAmount: discountValue,
            items: {
              create: orderItems.map((item: any) => ({
                productId: String(item.id),
                quantity: Number(item.quantity),
                price: Number(item.sale_price),
                selectedOptions: item.selectedOptions ?? undefined,
              })),
            },
          },
        });
        // Update product stock and analytics after successful order creation
        for (const item of orderItems) {
          const productId = String(item.id);
          const quantity = Number(item.quantity);
          const itemShopId = String(item.shopId);

          //  Update product stock and sales
          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });

          //  Upsert product analytics
          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId: itemShopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
              lastViewedAt: new Date(),
            },
          });

          //  Update user analytics (record purchase action)
          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId: normalizedUserId },
          });

          const newAction: Prisma.InputJsonValue = {
            productId,
            shopId: itemShopId,
            action: "purchase",
            timestamp: new Date().toISOString(),
          };

          if (existingAnalytics) {
            const currentActions: Prisma.JsonValue[] = Array.isArray(
              existingAnalytics.actions
            )
              ? (existingAnalytics.actions as Prisma.JsonValue[])
              : [];

            const sanitizedActions = currentActions.filter(
              (action): action is Exclude<Prisma.JsonValue, null> =>
                action !== null
            );

            const updatedActions: Prisma.InputJsonValue[] = [
              ...sanitizedActions,
              newAction,
            ];

            await prisma.userAnalytics.update({
              where: { userId: normalizedUserId },
              data: {
                lastVisited: new Date(),
                actions: {
                  set: updatedActions,
                },
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId: normalizedUserId,
                lastVisited: new Date(),
                actions: [newAction],
              },
            });
          }
        }

        console.log(
          "[OrderService] Preparing to send order confirmation email",
          {
            to: email,
            sessionId,
            template: "order-confirmation",
          }
        );

        await sendEmail(
          email,
          "Your ShopBizz Order Confirmation",
          "order-confirmation",
          {
            name,
            cart,
            totalAmount: coupon ? orderTotal - discountValue : orderTotal,
            trackingUrl: `https://shopbizz.com/orders/${sessionId}`,
          }
        );
      }

      // Create notifications for sellers
      const createdShopIds = Object.keys(shopGrouped);
      const sellerShops = await prisma.shops.findMany({
        where: {
          id: {
            in: createdShopIds,
          },
        },
        select: {
          id: true,
          sellerId: true,
          name: true,
        },
      });

      for (const shop of sellerShops) {
        const firstProduct = shopGrouped[shop.id][0];
        const productTitle = firstProduct.title || "new item";

        await prisma.notifications.create({
          data: {
            title: `New Order for ${shop.name}`,
            message: `${name} has placed an order for ${productTitle}.`,
            creatorId: String(userId),
            receiverId: String(shop.sellerId),
            redirect_link: `https://shopbizz.com/orders/${sessionId}`,
          },
        });
      }

      // create notification for admin
      await prisma.notifications.create({
        data: {
          title: "New Order Placed",
          message: `${name} has placed an order.`,
          creatorId: String(userId),
          receiverId: "admin",
          redirect_link: `https://shopbizz.com/orders/${sessionId}`,
        },
      });

      await redis.del(sessionKey);
    }
    return res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// get sellers orders
export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller?.id },
    });

    // fetch all orders of the shop
    const orders = await prisma.orders.findMany({
      where: { shopId: shop?.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};
export const getAdminOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // fetch all orders of the shop
    const orders = await prisma.orders.findMany({
      include: {
        user: true,
        shop: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};
// get order details
export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const shippingAddress = order.shippingAddressId
      ? await prisma.address.findUnique({
          where: { id: order.shippingAddressId },
        })
      : null;

    const coupon = order.couponCode
      ? await prisma.discount_codes.findUnique({
          where: { discountCode: order.couponCode },
        })
      : null;

    const productIds = order.items.map((item) => item.productId);
    const products = await prisma.products.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );
    const items = order.items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));
    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        coupon,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// update order
export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params as { orderId?: string };
    const { deliveryStatus } = req.body as { deliveryStatus?: string };

    if (!orderId || !deliveryStatus) {
      return res.status(400).json({
        error: "Missing order ID or delivery status.",
      });
    }

    const allowedStatuses = [
      "Ordered",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ] as const;

    if (!allowedStatuses.includes(deliveryStatus as any)) {
      return next(new ValidationError("Invalid delivery status."));
    }

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return next(new NotFoundError("Order not found!"));
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: deliveryStatus,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

// verify coupon code

export const verifyCouponCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body ?? {};

    // Basic input validation
    if (typeof couponCode !== "string" || !couponCode.trim()) {
      return res.status(400).json({
        message: "couponCode is required and must be a non-empty string.",
      });
    }
    if (!Array.isArray(cart)) {
      return res
        .status(400)
        .json({ message: "cart is required and must be an array." });
    }
    if (cart.length === 0) {
      return res
        .status(400)
        .json({ message: "cart is empty; nothing to apply the coupon to." });
    }

    const normalizedCode = couponCode.trim();

    // Look up the coupon
    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: normalizedCode }, // ensure discountCode is UNIQUE in your schema
    });

    if (!discount) {
      return res
        .status(404)
        .json({ message: "Invalid or unknown coupon code." });
    }

    // Find a matching product in the cart
    const matchingProduct = cart.find(
      (item: any) =>
        Array.isArray(item?.discount_codes) &&
        item.discount_codes?.some((d: any) => {
          return d === discount.id;
        })
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discountAmount: 0,
        discount: 0,
        message: "No matching product in the cart for this coupon.",
      });
    }

    // Calculate discount
    const price = Number(
      matchingProduct.sale_price ?? matchingProduct.price ?? 0
    );
    if (!Number.isFinite(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Matching product has no valid price to discount." });
    }

    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = (price * Number(discount.discountValue)) / 100;
    } else if (discount.discountType === "flat") {
      discountAmount = Number(discount.discountValue);
    } else {
      return res.status(400).json({ message: "Unsupported discount type." });
    }

    discountAmount = Math.min(Math.max(discountAmount, 0), price);

    return res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountedProductId: matchingProduct.id,
      discountType: discount.discountType,
      message: "Discount applied to 1 eligible product.",
    });
  } catch (error) {
    next(error);
  }
};

// get user orders
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { userId: req.user?.id },
      include: {
        items: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
};
