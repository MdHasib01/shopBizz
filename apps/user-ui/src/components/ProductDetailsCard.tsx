"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Rating from "./Ratings";
import { Heart, MapPin, MessageCircle, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import RichTextDisplay from "./RichTextDisplay";
import { useStore } from "@/store";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useUser } from "@/hooks/useUser";
import useDeviceTracking from "@/hooks/useDeviceTracking";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || 0);
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || 0);
  const [quantity, setQuantity] = useState(1);
  const { user } = useUser();

  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  // wishlist store ----
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWshlisted = wishlist.some((item: any) => item.id === data.id);

  // cart store ----
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === data.id);
  const addToCart = useStore((state: any) => state.addToCart);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const router = useRouter();
  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="md:mt-14 2xl:mt-0 max-h-[90vh] overflow-scroll min-h-[70vh] p-4 w-[95%] md:w-[70%] bg-white rounded-lg shadow-md z-99999!"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <Image
              src={data?.images?.[activeImage]?.url}
              alt={data?.images?.[activeImage]?.url}
              height={500}
              width={500}
              className="w-full max-h-[400px] rounded-lg object-contain"
            />
            {/* Thumbnails  */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {data?.images?.map((image: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-md border p-2 ${
                    activeImage === index
                      ? "border-gray-900 pt-1"
                      : "border-transparent "
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image?.url}
                    alt={image?.url}
                    height={50}
                    width={50}
                    className="w-full rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* seller info  */}
            <div className="border-b relative pb-3 border-gray-300 ">
              <div className="flex items-center-justify-between">
                <div className="flex items-start gap-3">
                  <Image
                    src={data?.shop?.avatar}
                    alt={data?.shop?.avatar}
                    height={50}
                    width={50}
                    className="w-[60px] h-[60px] rounded-full object-cover"
                  />
                </div>
                <div className="text-lg font-medium">
                  <Link href={`/shop/${data?.shop?.id}`}>
                    <span>{data?.shop?.name}</span>
                  </Link>
                  <span className="block mt-1">
                    <Rating rating={data?.shop?.rating}></Rating>
                  </span>
                  <p className="flex items-center gap-1 text-gray-500">
                    <MapPin size={20} />{" "}
                    {data?.shop?.address || "Location not available"}
                  </p>
                </div>
              </div>
              <button
                className="flex cursor-pointer tiems-center gap-2 mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => router.push(`/ibox?shopId=${data?.shop?.id}`)}
              >
                <MessageCircle size={22} /> <span>Chat with seller</span>
              </button>
              <button className="absolute top-2 right-2">
                <X size={20} onClick={() => setOpen(false)} />
              </button>
            </div>
            <h3 className="text-xl font-semibold mt-3">{data?.title}</h3>
            <p className="text-gray-500 mt-2">{data?.short_description}</p>
            {data?.brand && (
              <p className="text-gray-500 mt-2">
                <span className="font-semibold">Brand:</span> {data?.brand}
              </p>
            )}
            <div className="flex flex-col md:flex-row tiems-start gap-5 mt-4">
              {data?.colros?.length > 0 && (
                <div>
                  <strong>Color:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.colors.map((color: any, index: number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 cursor-pointer rounded-full border-2 transition duration-300 ${
                          color === isSelected
                            ? "border-blue-500"
                            : "border-transparent"
                        }`}
                        onClick={() => setIsSelected(color)}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {data?.sizes?.length > 0 && (
                <div>
                  <strong>Size:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.sizes.map((size: any, index: number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 cursor-pointer rounded-full border-2 transition duration-300 ${
                          size === isSizeSelected
                            ? "border-blue-500"
                            : "border-transparent"
                        }`}
                        onClick={() => setIsSizeSelected(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center gap-4">
                <h3 className="text-2xl font semibold text-gray-900">
                  ${data?.sale_price}
                </h3>
                {data?.regular_price && (
                  <h3 className="text-red-500 line-through">
                    ${data?.regular_price}
                  </h3>
                )}
              </div>
              <div className="mt-5 flex items-center gap-5">
                <div className="flex items-center rounded-md">
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>{" "}
                  <span className="px-4 bg-gray-100 font-semibold py-1">
                    {quantity}
                  </span>
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                    onClick={() => setQuantity((prev) => Math.max(1, prev + 1))}
                  >
                    +
                  </button>
                </div>
                <button
                  disabled={isInCart}
                  onClick={() =>
                    addToCart(
                      {
                        ...data,
                        quantity,
                        selectedOptions: {
                          color: isSelected,
                          size: isSizeSelected,
                        },
                      },
                      user,
                      location,
                      deviceInfo
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${
                    isInCart
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <ShoppingCart size={18} />
                </button>
                <button className="opacity-[0.7] cursor-pointer">
                  <Heart
                    size={30}
                    fill={isWshlisted ? "red" : "transparent"}
                    stroke={isWshlisted ? "red" : "#4B5563"}
                    onClick={() =>
                      isWshlisted
                        ? removeFromWishlist(
                            data.id,
                            user,
                            location,
                            deviceInfo
                          )
                        : addToWishlist(
                            { ...data, quantity: 1 },
                            user,
                            location,
                            deviceInfo
                          )
                    }
                  />
                </button>
              </div>
            </div>
            <div className="mt-3">
              {data.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  In stock: {data.stock}
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of stock</span>
              )}
            </div>
            <div className="mt-3 text-gray-600 text-sm">
              Estimated Delivery:{" "}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </div>

            <RichTextDisplay
              content={data?.detailed_description}
              className="bg-gray-50 p-6 rounded-lg mt-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
