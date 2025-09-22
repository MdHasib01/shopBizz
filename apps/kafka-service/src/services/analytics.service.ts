import { create } from "domain";
import prisma from "../../../../packages/libs/prisma";

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
    });

    let updateActions: any = existingData?.actions || [];

    const actionExists = updateActions.some(
      (entry: any) =>
        entry.productId === event.productId && entry.action === event.action
    );

    if (event.action === "product_view") {
      updateActions.push({
        productId: event.productId,
        shopId: event.shopId,
        action: event.action,
        timestamp: new Date(),
      });
    } else if (
      ["add_to_wishlist", "add_to_cart"].includes(event.action) &&
      !actionExists
    ) {
      updateActions.push({
        productId: event.productId,
        shopId: event.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    } else if (event.action === "remove_from_cart") {
      updateActions.filter(
        (entry: any) =>
          entry.productId !== event.productId && entry.action !== "add_to_cart"
      );
    } else if (event.action === "remove_from_wishlist") {
      updateActions.filter(
        (entry: any) =>
          entry.productId !== event.productId &&
          entry.action !== "add_to_wishlist"
      );
    }

    // keep only the last 100 actions for each user
    if (updateActions.length > 100) {
      updateActions.shift();
    }

    const extraFields: Record<string, any> = {};

    if (event.country) extraFields.country = event.country;
    if (event.city) extraFields.city = event.city;
    if (event.device) extraFields.device = event.device;

    await prisma.userAnalytics.upsert({
      where: {
        userId: event.userId,
      },
      update: {
        lastVisited: new Date(),
        actions: updateActions,
        ...extraFields,
      },
      create: {
        userId: event.userId,

        lastVisited: new Date(),
        actions: updateActions,
        ...extraFields,
      },
    });

    await updateProductAnalytics(event);
  } catch (error) {
    console.log("Error Processing Event: ", error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    const updateFields: any = {};

    if (event.action === "product_view") updateFields.views = { increment: 1 };
    if (event.actoin === "add_to_cart")
      updateFields.cartAdds = { increment: 1 };
    if (event.actoin === "add_to_wishlist")
      updateFields.wishlistAdds = { increment: 1 };
    if (event.action === "remove_from_cart")
      updateFields.cartAdds = { increment: -1 };
    if (event.action === "remove_from_wishlist")
      updateFields.wishlistAdds = { increment: -1 };
    if (event.action === "purchase") updateFields.purchases = { increment: 1 };

    await prisma.productAnalytics.upsert({
      where: {
        productId: event.productId,
      },
      update: { lastViewedAt: new Date(), ...updateFields },
      create: {
        productId: event.productId,
        shopId: event.shopId,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.log("Error Processing Event: ", error);
  }
};
