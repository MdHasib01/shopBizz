"use client";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/store";
import { Loader2, ShoppingCartIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [discoundedProductId, setDiscoundedProductId] = React.useState("");
  const [discoundPercent, setDiscoundPercent] = React.useState(0);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const addToCart = useStore((state: any) => state.addToCart);
  const [couponCode, setCouponCode] = React.useState("");
  const [selectedAddressId, setSelectedAddressId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const cart = useStore((state: any) => state.cart);
  const removeItem = (id: string) => {
    removeFromCart(id, user, deviceInfo, location);
    toast.success("Item removed from cart");
  };
  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.sale_price * item.quantity,
    0
  );
  const incrementQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  };

  const decrementQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const couponCodeHandler = () => {};
  return (
    <div className="w-full bg-white">
      <div className="w-[95%] md:w[80%] min-h-screen mx-auto container">
        <h2 className="text-2xl font-bold mt-6">Shopping Cart</h2>
        <div className="flex  mx-auto items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link
            href="/"
            className="hover:text-gray-900 transition-colors duration-200"
          >
            Home
          </Link>

          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          <span className="text-gray-900 font-medium">Cart</span>
        </div>

        {/* Wishlist table  */}
        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your cart is empty. Start adding products to your cart.
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="bg-[#f1f3f4]">
                <tr>
                  <th className="text-left pl-4 py-3">Product</th>
                  <th className="text-left px-6 py-3">Price</th>
                  <th className="text-left px-6 py-3">Quantity</th>
                  <th className="text-left px-6 py-3">Action</th>
                  <th className="text-left px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item: any) => (
                  <tr key={item.id} className="border-b border-b[#00000000e]">
                    <td className="flex items-center gap-3 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded-md"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        {item.selectedOptions && (
                          <div className="text-sm text-gray-500">
                            {item?.selectedOptions?.color && (
                              <span className="mr-2">
                                Color:{" "}
                                <span
                                  style={{
                                    backgroundColor:
                                      item?.selectedOptions?.color,
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "100%",
                                    display: "inline-block",
                                  }}
                                />
                              </span>
                            )}
                            {item?.selectedOptions?.size && (
                              <span className="mr-2">
                                Size: {item?.selectedOptions?.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 text-lg">
                      {item?.id === discoundedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-gray-500 text-sm">
                            ${item?.sale_price.toFixed(2)}
                          </span>
                          <span className="text-green-600 font-semibold">
                            $
                            {(
                              (item?.sale_price * (100 - discoundPercent)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-xs bg-green-500 py-1 px-2 rounded-full">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span>${item?.sale_price?.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 text-lg">
                      <div className="flex justify-center border border-gray-300 rounded-[20px] w-[90px] items-center p-[2px]">
                        <button
                          className="text-xl text-black cursor-pointer"
                          onClick={() => {
                            decrementQuantity(item.id);
                          }}
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          className="text-xl text-black cursor-pointer"
                          onClick={() => {
                            incrementQuantity(item.id);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 text-lg gap-4">
                      <button
                        className="text-red-500 cursor-pointer "
                        onClick={() => {
                          removeItem(item.id);
                        }}
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-1">
                  <span className="font-jost">
                    Discount ({discoundPercent}%)
                  </span>
                  <span className="text-green -600">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-3">
                <span className="font-jost">Subtotal</span>
                <span className="text-green -600">
                  ${(subtotal - discountAmount).toFixed(2)}
                </span>
              </div>
              <hr className="my-4 text-slate-200" />
              <div className="mb-4">
                <h4 className="mb-[7px] font-[500] text-[15px]">
                  Have a Coupon?
                </h4>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    placeholder="Entyer coupon code"
                    className="w-full border border-gray-300 rounded-md p-2 mr-2 "
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    className="bg-[#010f1c] text-white py-2 px-4 rounded-md"
                    onClick={couponCodeHandler}
                  >
                    {" "}
                    Apply
                  </button>
                  {/* {error && <p className="text-red-500 mt-2">{error}</p>} */}
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-[7px] font-medium text-[15px]">
                    Select Shipping Address
                  </h4>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2  "
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="">Home - New York - usa</option>
                  </select>
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-[7px] font-medium text-[15px]">
                    Select Payment Method
                  </h4>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2  "
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="credit_card">Online Payment</option>
                    <option value="cash_on_delivery">Cash On Delivery</option>
                  </select>
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3">
                  <span className="font-jost">Total</span>
                  <span>${(subtotal - discountAmount).toFixed(2)}</span>
                </div>

                <button
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989ff] transition-all rounded-lg"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />}
                  {loading ? "Redirecting ..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
