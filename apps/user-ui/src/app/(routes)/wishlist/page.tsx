"use client";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/store";
import { ShoppingCartIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

const WishListPage = () => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const decrementQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const incrementQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id, user, deviceInfo, location);
    toast.success("Item removed from wishlist");
  };

  return (
    <div className="w-full bg-white">
      <div className="w-[95%] md:w[80%] min-h-screen mx-auto container">
        <h2 className="text-2xl font-bold mt-6">Wishlist</h2>
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

          <span className="text-gray-900 font-medium">Wishlist</span>
        </div>

        {/* Wishlist table  */}
        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your wishlist is empty. Start adding products to your wishlist.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <table className="w-full border-collapse">
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
                {wishlist.map((item: any) => (
                  <tr key={item.id} className="border-b border-b[#00000000e]">
                    <td className="flex items-center gap-3 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded-md"
                      />
                      <span>{item.title}</span>
                    </td>
                    <td className="px-6 text-lg">
                      ${item?.sale_price.toFixed(2)}
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
                        className="text-blue-500 cursor-pointer mr-3"
                        onClick={() => {
                          addToCart(item, user, deviceInfo, location);
                        }}
                      >
                        <ShoppingCartIcon className="w-6 h-6" />
                      </button>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListPage;
