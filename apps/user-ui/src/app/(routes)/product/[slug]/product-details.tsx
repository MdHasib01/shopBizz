"use client";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingCart,
  Truck,
  WalletMinimal,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import ReactImageMagnify from "react-image-magnify";
import Ratings from "@/components/Ratings";
import Link from "next/link";
import { useStore } from "@/store";
import { useUser } from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import ProductCard from "@/components/ProductCard";
import axiosInstance from "@/utils/axiosInstance";

const ProductDetails = ({ productDetails }: any) => {
  const [currentImage, setCurrentImage] = React.useState(
    productDetails?.images?.[0]?.url
  );

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isSelected, setIsSelected] = React.useState(
    productDetails?.colors?.[0] || ""
  );
  const [isSizeSelected, setIsSizeSelected] = React.useState(
    productDetails?.sizes?.[0] || ""
  );
  const [quantity, setQuantity] = React.useState(1);
  const [priceRange, setPriceRange] = React.useState([
    productDetails?.sale_price,
    1199,
  ]);

  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  console.log(" location", location);
  const deviceInfo = useDeviceTracking();

  const [recommendedProducts, setRecommendedProducts] = React.useState([]);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id
  );

  const prevImage = () => {
    if (currentImage > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images?.[currentIndex - 1]?.url);
    }
  };
  const nextImage = () => {
    if (currentImage < productDetails?.images?.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images?.[currentIndex + 1]?.url);
    }
  };

  const discountPercentage = Math.round(
    ((productDetails?.regular_price - productDetails?.sale_price) /
      productDetails?.regular_price) *
      100
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));
      query.set("page", "1");
      query.set("limit", "5");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );

      setRecommendedProducts(res.data.products);
    } catch (error) {
      console.error("Failed to fetch filtered products", error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] lg:w-[80%] bg-white mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        {/* left column - Product images */}
        <div className="p-4">
          <div className="relative w-full">
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: "product image",
                  isFluidWidth: true,
                  src:
                    currentImage ||
                    "https://ik.imagekit.io/shopbizz/products/smartwatch-removebg-preview.png?updatedAt=1754796357903",
                },
                largeImage: {
                  src:
                    currentImage ||
                    "https://ik.imagekit.io/shopbizz/products/smartwatch-removebg-preview.png?updatedAt=1754796357903",
                  width: 1200,
                  height: 1200,
                },
                enlargedImagePosition: "right",
                enlargedImageContainerDimensions: {
                  width: "150%",
                  height: "150%",
                },
                enlargedImageContainerStyle: {
                  border: "none",
                  boxShadow: "none",
                },
              }}
            />
          </div>
          {/* Thumbnail images array */}
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 z-10 bg-white p-2 rounded-full shadow-md"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto">
              {productDetails?.images?.map((image: any, index: number) => (
                <Image
                  key={index}
                  width={100}
                  height={100}
                  src={
                    image.url ||
                    "https://ik.imagekit.io/shopbizz/products/smartwatch-removebg-preview.png?updatedAt=1754796357903"
                  }
                  alt={image.alt}
                  className={`w-16 h-16 object-cover cursor-pointer ${
                    index === currentIndex
                      ? "border-2 border-black"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(image?.url);
                  }}
                />
              ))}
            </div>
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 z-10 bg-white p-2 rounded-full shadow-md"
                onClick={nextImage}
                disabled={currentIndex === 0}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
        {/* Middle column - product details  */}
        <div className="p-4">
          <h1 className="text-xl mb-2 font-medium">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={productDetails?.ratings} />
              <Link href={"#reviews"} className="text-blue-500 hover:underline">
                (0 reviews)
              </Link>
            </div>
            <div>
              <Heart
                size={24}
                fill={isWishlisted ? "red" : "transparent"}
                className="cursor-pointer"
                color={isWishlisted ? "red" : "#777"}
                onClick={() =>
                  isWishlisted
                    ? removeFromWishlist(
                        productDetails.id,
                        user,
                        deviceInfo,
                        location
                      )
                    : addToWishlist({
                        ...productDetails,
                        quantity,
                        selectedOption: {
                          color: isSelected,
                          size: isSizeSelected,
                        },
                        user,
                        deviceInfo,
                        location,
                      })
                }
              />
            </div>
          </div>
          <div className="py-2 border-b bordere-gray-200">
            <span className="text-gray-500">
              Brand:{" "}
              <span className="text-blue-500">
                {productDetails?.brand || "Brand not found"}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3-xl font-bold text-orange-500">
              ${productDetails?.sale_price}
            </span>
            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${productDetails?.regular_price}
              </span>
              <span className="text-gray-500">-{discountPercentage}%</span>
            </div>
            {/* ------ Colour options -----------  */}
            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map(
                        (color: string, index: number) => (
                          <button
                            key={index}
                            className={`w-6 h-6 rounded-full cursor-pointer border-2 transition ${
                              isSelected === color
                                ? "border-gray-400 scale-110 shadow-md"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setIsSelected(color)}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ------ Size options -----------  */}
            {productDetails?.sizes?.length > 0 && (
              <div>
                <strong>Size:</strong>
                <div className="flex gap-2 mt-1">
                  {productDetails?.sizes?.map((size: string, index: number) => (
                    <button
                      key={index}
                      className={`px-4 py-1 rounded-md cursor-pointer border-2 transition ${
                        isSizeSelected === size
                          ? "bg-gray-800 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                      onClick={() => setIsSizeSelected(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6">
            <div className="flex item-center gap-3">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev + 1))}
                >
                  +
                </button>
              </div>
              {productDetails?.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  In Stock{" "}
                  <span className="text-gray-500 font-medium">
                    (Stock {productDetails?.stock})
                  </span>{" "}
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
            <button
              className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg[#e64a19] text-white font-medium rounded-lg ${
                isInCart ? "bg-gray-400 cursor-not-allowed" : "cursor-pointer"
              }`}
              disabled={isInCart || productDetails?.stock === 0}
              onClick={() => {
                addToCart({
                  ...productDetails,
                  quantity,
                  selectedOptions: {
                    color: isSelected,
                    size: isSizeSelected,
                  },
                  user,
                  location,
                  deviceInfo,
                });
              }}
            >
              <ShoppingCart size={20} />
              {isInCart ? "Added to cart" : "Add to cart"}
            </button>
          </div>
        </div>

        {/* Right column - seller incormation */}
        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-2 border-b border-b-gray-100">
            {location?.city && (
              <span className="text-sm text-gray-600">
                Delivery option
                <div className="flex items-center text-gray-600 gap-1">
                  <MapPin size={16} className="ml-[-5px]" />{" "}
                  <span className="text-lg font-normal">
                    {location?.city + ", " + location?.country}
                  </span>
                </div>
              </span>
            )}
          </div>
          <div className="mb-1 px-3 pb-1 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>
            <div className="flex items-center text-gray-600 gap-1">
              <Package size={16} className="ml-[-5px]" />{" "}
              <span className="text-base font-normal">7 Days Returns</span>
            </div>
            <div className="flex items-center text-gray-600 gap-1 py-2">
              <WalletMinimal size={16} className="ml-[-5px]" />{" "}
              <span className="text-base font-normal">
                Warranty Not Applicable
              </span>
            </div>
            <div className="w-[85%] rounded-lg">
              {/* Sold by section */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 font-light">
                    Sold by
                  </span>
                  <span className="block max-w-[150px] truncate font-medium text-lg">
                    {productDetails?.shop?.name}
                  </span>
                </div>
                <Link
                  href={"#"}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText size={20} /> Chat Now
                </Link>
              </div>
              {/* Seller performance stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-3">
                <div>
                  <p className="text-[12px] text-gray-500">
                    Positive Seller Ratings
                  </p>
                  <p className="text-lg font-semibold">88%</p>
                </div>

                <div>
                  <p className="text-[12px] text-gray-500">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>

                <div>
                  <p className="text-[12px] text-gray-500">
                    Chat Response Rate
                  </p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
              </div>
              {/* Go to Store */}
              <div className="text-center mt-4 border-t border-t-gray-200 pt-2">
                <Link
                  href={`/shop/${productDetails?.shop?.id}`}
                  className="text-blue-500 font-medium text-sm hover:underline"
                >
                  GO TO STORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product details */}
      <div className="w-[90%] lg:w-[80%] m-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Produdct details of {productDetails?.title}
          </h3>
          <div
            className="prose prose-sm text-slate-400 max-w-none"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description,
            }}
          />
        </div>
      </div>

      {/* Product reviews */}
      <div className="w-[90%] lg:w-[80%] m-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Ragings and Reviews of {productDetails?.title}
          </h3>
          <div className="mt-3">
            <div className="text-center pt-14">No reviews available</div>
          </div>
        </div>
      </div>

      {/* Product questions */}
      <div className="w-[90%] lg:w-[80%] m-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">You may also like</h3>
          <div className="m-auto grid gird-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {recommendedProducts?.map((product: any) => (
              <ProductCard key={product?.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
