import Link from "next/link";
import React from "react";
import Rating from "./Ratings";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
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
    </div>
  );
};

export default ProductCard;
