"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Rating from "./Ratings";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import ProductDetailsCard from "./ProductDetailsCard";
import { useStore } from "@/store";
import { useUser } from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  // wishlist store ----
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWshlisted = wishlist.some((item: any) => item.id === product.id);

  // cart store ----
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);
  const addToCart = useStore((state: any) => state.addToCart);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product?.ending_date).getTime();
        const currentTime = new Date().getTime();
        const diff = endTime - currentTime;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.ending_date]);

  return (
    <div className="w-ful min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-ged-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}
      {product.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          Limited Stock
        </div>
      )}

      <Link href={`/products/${product?.slug}`}>
        <img
          src={product?.images[0]?.url || ""}
          alt={product?.title || ""}
          width={300}
          height={300}
          className="w-full h-[200px] object-contain mx-auto rounded-t-md"
        />
      </Link>

      <Link href={`/products/${product?.shop?.id}`}>
        <h2 className="text-lg font-semibold text-blue-500 mt-2 px-4">
          {product?.shop?.name}
        </h2>
      </Link>
      <Link href={`/products/${product?.slug}`}>
        <h3 className="text-sm font-semibold text-slate-700 mt-2 px-4">
          {product?.title}
        </h3>
      </Link>
      <div className="mt-2 px-2 ">
        <Rating rating={product?.ratings} />
      </div>
      <div className="mt-2 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${product?.sale_price}
          </span>
          <span className="text-sm font-bold text-gray-400 line-through">
            ${product?.regular_price}
          </span>
        </div>
        <span className="text-green-500 text-sm font-medium">
          {product?.totalSales}
        </span>
      </div>
      {isEvent && timeLeft && (
        <div className="mt-2">
          <div className="inline-block text-xs bg-orange-100 text-orange-500">
            {timeLeft}
          </div>
        </div>
      )}
      <div className="absolute z-10 flex flex-col gap-3 right-3 top-10">
        <div className="bg-white rounded-full p-[6px] shadow-md">
          <Heart
            className="cursor-pointer hover:scale-110 transation"
            size={22}
            fill={isWshlisted ? "red" : "transparent"}
            stroke={isWshlisted ? "red" : "#4B5563"}
            onClick={() =>
              isWshlisted
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo
                  )
            }
          />
        </div>
        <div className="bg-white rounded-full shadow-md p-[6px]">
          <Eye
            className="cursor-pointer text-[#4b5563] hover:scale-110 transation"
            size={22}
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="bg-white rounded-full shadow-md p-[6px]">
          <ShoppingBag
            className="cursor-pointer text-[#4b5563] hover:scale-110 transation"
            size={22}
            onClick={() =>
              !isInCart &&
              addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)
            }
          />
        </div>
      </div>
      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
};

export default ProductCard;
