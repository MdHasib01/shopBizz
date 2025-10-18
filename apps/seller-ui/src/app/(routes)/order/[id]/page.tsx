"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;

type DeliveryStatus = (typeof statuses)[number];

type APIOrder = {
  id?: string;
  orderNumber?: string;
  status?: string; // payment status from API (e.g., "Paid")
  subtotal?: number;
  shipping?: number;
  discount?: number;
  tax?: number;
  total?: number;
  currency?: string;
  discountAmount?: number;
  couponCode?: any | null;
  createdAt?: string;
  updatedAt?: string;
  user?: { id?: string; name?: string; email?: string };
  deliveryStatus?: DeliveryStatus;
  shippingAddress?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  } | null;
  items?: Array<{
    productId?: string;
    price?: number;
    quantity?: number;
    product?: { title?: string; image?: Array<{ url?: string } | string> };
    selectedOptions?: Record<string, string>;
  }>;
  coupon?: { public_name?: string } | null;
};

const Page = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<APIOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const currentDeliveryStatus: DeliveryStatus = useMemo(() => {
    const raw =
      (order?.deliveryStatus as DeliveryStatus | undefined) ||
      (undefined as DeliveryStatus | undefined);
    if (raw && statuses.includes(raw)) return raw;
    const paidLike = (order?.status || "").toLowerCase();
    if (["delivered", "complete", "completed"].includes(paidLike as any))
      return "Delivered";
    return "Ordered";
  }, [order?.deliveryStatus, order?.status]);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      const list: APIOrder[] = Array.isArray(res?.data?.orders)
        ? res.data.orders
        : [];
      const found =
        list.find((o) => o?.id === orderId || o?.orderNumber === orderId) ||
        list[0] ||
        null;
      setOrder(found);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as DeliveryStatus;
    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/update-status/${orderId}`, {
        deliveryStatus: newStatus,
      });
      setOrder((prev) =>
        prev ? { ...prev, deliveryStatus: newStatus } : prev
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-background">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <p className="text-center text-sm text-destructive px-4 py-10 bg-background">
        Order not found.
      </p>
    );
  }

  const formatMoney = (n?: number) =>
    typeof n === "number" ? n.toFixed(2) : undefined;

  const orderDisplayId =
    order?.orderNumber || order?.id?.slice(-6)?.toUpperCase();

  const currentIndex = Math.max(0, statuses.indexOf(currentDeliveryStatus));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-background text-foreground">
      {/* Back to Dashboard */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/orders")}
        className="inline-flex items-center gap-2 font-semibold cursor-pointer text-foreground hover:text-foreground/80"
      >
        <ArrowLeft className="size-4" />
        <span>Go Back to Dashboard</span>
      </button>

      {/* Order Header */}
      <h1 className="text-2xl font-bold my-4">Order #{orderDisplayId}</h1>

      {/* Status Selector */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mr-3">
          Update Delivery Status:
        </label>
        <select
          value={currentDeliveryStatus}
          onChange={handleStatusChange}
          disabled={updating}
          className="border bg-transparent text-foreground border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statuses.map((status, idx) => (
            <option
              key={status}
              value={status}
              disabled={idx < currentIndex}
              className="text-foreground bg-background"
            >
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Delivery Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
          {statuses.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>

        <div className="flex items-center">
          {statuses.map((step, idx) => {
            const reached = idx <= currentIndex;
            return (
              <div key={step} className={`flex-1 flex items-center`}>
                <div
                  className={`w-4 h-4 rounded-full ${
                    reached ? "bg-primary" : "bg-muted"
                  }`}
                />
                {idx !== statuses.length && (
                  <div
                    className={`flex-1 h-1 ${
                      reached ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Info */}
      <div className="space-y-4 text-sm text-foreground mb-6">
        <p>
          <span className="font-semibold text-muted-foreground mr-1">
            Payment Status:
          </span>
          <span
            className={`font-medium ${
              order.status && order.status.toLowerCase() === "paid"
                ? "text-primary"
                : "text-destructive"
            }`}
          >
            {order.status || "Unknown"}
          </span>
        </p>

        <p>
          <span className="font-semibold text-muted-foreground mr-1">
            Total Paid:
          </span>{" "}
          ${order?.total?.toFixed?.(2) ?? formatMoney(order.total) ?? "0.00"}
        </p>

        {!!(order.discountAmount && order.discountAmount > 0) && (
          <p>
            <span className="font-semibold text-muted-foreground mr-1">
              Discount Applied:
            </span>
            <span className="text-primary">
              -${formatMoney(order.discountAmount)}
            </span>
          </p>
        )}

        {(order.couponCode || (order as any).coupon) && (
          <p>
            <span className="font-semibold text-muted-foreground mr-1">
              Coupon Used:
            </span>
            <span className="text-accent">
              {(order as any).couponCode?.public_name ||
                (order as any).coupon?.public_name}
            </span>
          </p>
        )}

        <p>
          <span className="font-semibold text-muted-foreground mr-1">
            Date:
          </span>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "—"}
        </p>
      </div>

      {/* Shipping Address */}
      {!!order.shippingAddress && (
        <div className="mb-6 text-sm text-foreground">
          <h2 className="text-md font-semibold mb-2">Shipping Address</h2>
          {order.shippingAddress?.street && (
            <p className="text-foreground">{order.shippingAddress.street}</p>
          )}
          {(order.shippingAddress?.city || order.shippingAddress?.zipCode) && (
            <p className="text-muted-foreground">
              {order.shippingAddress?.city}
              {order.shippingAddress?.city && order.shippingAddress?.zipCode
                ? ", "
                : ""}
              {order.shippingAddress?.zipCode}
            </p>
          )}
          {order.shippingAddress?.country && (
            <p className="text-muted-foreground">
              {order.shippingAddress.country}
            </p>
          )}
        </div>
      )}

      {/* Order Items */}
      {!!order?.items?.length && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items!.map((item, idx) => {
              const imageField = (item.product?.image ?? []) as any[];
              const firstImage = Array.isArray(imageField)
                ? imageField[0] &&
                  (typeof imageField[0] === "string"
                    ? imageField[0]
                    : imageField[0]?.url)
                : undefined;
              return (
                <div
                  key={item.productId || idx}
                  className="border border-border rounded-md p-4 flex items-center gap-4 bg-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firstImage || "/placeholder.png"}
                    alt={item.product?.title || "Product Image"}
                    className="w-16 h-16 object-cover rounded-md border border-border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.product?.title || "Unnamed Product"}
                    </p>
                    {typeof item.quantity === "number" && (
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    )}

                    {!!item.selectedOptions &&
                      Object.keys(item.selectedOptions).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {Object.entries(item.selectedOptions).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center gap-1"
                              >
                                <span className="font-semibold capitalize text-foreground">
                                  {key}:
                                </span>
                                <span className="text-muted-foreground">
                                  {String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    $
                    {item?.price?.toFixed?.(2) ??
                      (typeof item.price === "number"
                        ? item.price.toFixed(2)
                        : "0.00")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
