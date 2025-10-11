import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [string];
    rating?: number;
    category?: string;
  };
}
const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="w-full rounded-md coursor-pointer bg-white border-gray-200 shadow-sm overflow-hidden transition">
      {/* cover photo */}
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/shopbizz/products/product.png?updatedAt=1754902873558"
          }
          alt="shop cover"
          className="w-full h-full object-cover"
          fill
        ></Image>
      </div>
      {/* Avatar */}
      <div className="relative flex justify-center -mt-8 ">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
          <Image
            src={
              shop.avatar ||
              "https://ik.imagekit.io/shopbizz/products/product.png?updatedAt=1754902873558"
            }
            alt={shop.name}
            width={64}
            height={64}
            className="object-fit"
          ></Image>
        </div>
      </div>

      {/* Shop Info  */}
      <div className="px-4 b-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800">{shop.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} followers
        </p>

        {/* Address & Rating  */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}
          {shop.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 shrink-0 text-yellow-400 fill-yellow-400" />
              {shop.rating}
            </span>
          )}
        </div>
        {/* Category  */}
        {shop.category && (
          <span className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitazise text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {shop.category}
            </span>
          </span>
        )}

        {/* visit button  */}

        <div className="my-4">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition"
          >
            Visit Shop <ArrowUpRight className="w-4 h-4 ml-" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
