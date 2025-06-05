"use client";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiMenu2Line, RiShoppingCartLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { navItems } from "@/configs/constants";
import Link from "next/link";
import { AiOutlineHeart } from "react-icons/ai";
import { HiOutlineUser } from "react-icons/hi2";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(true);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`w-full transation-all duration-300  ${
        isSticky ? "fixed top-0 left-0 z-[100]  bg-white shadow-lg" : "relative"
      }`}
    >
      <div
        className={`w-[80%] m-auto relative flex items-center justify-between ${
          isSticky ? "py-3" : "py-0"
        }`}
      >
        {/* All dorpdown  */}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2 "
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <RiMenu2Line color="white" />
            <span className="text-white font-medium">All Categories</span>
          </div>
          <IoMdArrowDropdown color="white" />
        </div>

        {/* Dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[260px] bg-[#f5f5f5] h-[400px] `}
          ></div>
        )}

        {/* Navigation Links  */}
        <div className="flex items-center">
          {navItems.map((item: NavItemsTypes, index: number) => (
            <Link
              href={item.href}
              key={index}
              className={`px-5 py-2 text-lg  font-semibold `}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div>
          {isSticky && (
            <div className="flex items-center  gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex justify-center items-center border border-color-[#f3f3f3]">
                  <HiOutlineUser className=" w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Hello,</p>
                  <Link className="text-sm font-semibold" href="/login">
                    Sign In
                  </Link>
                </div>
              </div>
              <div className="w-6 h-6 flex justify-center items-center relative">
                <RiShoppingCartLine className="w-6 h-6" />
                <div className="absolute top-[-5px] right-[-5px] border-white border flex justify-center text-xs  items-center w-4 h-4 bg-red-500 text-white rounded-full">
                  3
                </div>
              </div>
              <div className="w-6 h-6 flex justify-center items-center relative">
                <AiOutlineHeart className="w-6 h-6" />
                <div className="absolute top-[-5px] right-[-5px] border-white border flex justify-center text-xs  items-center w-4 h-4 bg-red-500 text-white rounded-full">
                  2
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
