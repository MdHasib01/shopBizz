"use client";
import NavItem from "@/components/nav.item";
import QuickActions from "@/components/quick.action";
import ShippingAddressSection from "@/components/ShippingAddress";
import StatCard from "@/components/stat.card";
import { profileFallbackImage } from "@/configs/fallback.image";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Loader2,
  Clock,
  Truck,
  CheckCircle,
  User,
  ShoppingBag,
  Bell,
  Inbox,
  MapPin,
  LogOut,
  Lock,
  Pencil,
  Gift,
  BadgeCheck,
  Receipt,
  Settings,
  PhoneCall,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = () => {
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryTab = searchParams.get("active") || "profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  useEffect(() => {
    if (activeTab != queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logOutHandler = async () => {
    await axios.post("/api/logout-user").then((res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });

      router.push("/login");
    });
  };
  return (
    <div className="bg-grey-50 p-6 pb-14">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="animate-spin inline w-5 h-5" />
              ) : (
                user?.name || "User"
              )}
            </span>
          </h1>
        </div>

        {/* Profile Overview  */}
        <div className="grid gird-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
          <StatCard title="Total Orders" count={10} Icon={Clock} />
          <StatCard title="Processing Orders" count={4} Icon={Truck} />
          <StatCard title="Completed Orders" count={5} Icon={CheckCircle} />
        </div>

        {/* sidebar and content layout  */}
        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* left navigation  */}
          <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 w-full md:w-1/4">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "inbox"}
                onClick={() => router.push("inbox")}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === "Notifications"}
                onClick={() => setActiveTab("Notifications")}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                active={activeTab === "logout"}
                onClick={logOutHandler}
              />
            </nav>
          </div>

          {/* Main Content  */}

          <div className="bg-white p-6 rounded-md shadow-md border border-gray-100 w-full md:w-55">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>
            {activeTab === "Profile" && !isLoading && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Image
                    src={user?.avatar || profileFallbackImage}
                    alt=""
                    width={60}
                    height={60}
                    className="w-16 h-16 rounded-full border border-gray-200"
                  />
                  <button className="flex gap-2 text-blue-500 hover:underline">
                    <Pencil className="w-4 h-4 " /> Change Photo
                  </button>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Name: {user?.name}</h2>
                  <p className="text-gray-500">Email: {user?.email}</p>

                  <p className="text-gray-500">
                    Joined: {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500">Earned Points: 0</p>
                </div>
              </div>
            ) : (
              activeTab === "Shipping Address" && <ShippingAddressSection />
            )}
          </div>

          {/* Right Quick Pannel  */}
          <div className="w-full md:w-1/4 space-y-4">
            <QuickActions
              Icon={Gift}
              title="Referral Program"
              description="Invite friends and get rewards."
            />
            <QuickActions
              Icon={BadgeCheck}
              title="Your Badges"
              description="View your badges and achievements."
            />
            <QuickActions
              Icon={Receipt}
              title="Billing History"
              description="Check your recent payments."
            />
            <QuickActions
              Icon={Settings}
              title="Account Settings"
              description="Manage Preferences and Security."
            />
            <QuickActions
              Icon={PhoneCall}
              title="Support Center"
              description="Need help? Contact support."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
