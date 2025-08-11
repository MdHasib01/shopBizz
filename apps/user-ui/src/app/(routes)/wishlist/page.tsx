"use client";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/store";
import React from "react";

const WishListPage = () => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  return (
    <div className="w-full bg-white">
      <div className="w-[95%] md:w[80%] min-h-screen mx-auto"></div>
    </div>
  );
};

export default WishListPage;
