import Link from "next/link";
import { CiSearch } from "react-icons/ci";
import { AiOutlineHeart } from "react-icons/ai";
import { HiOutlineUser } from "react-icons/hi2";
import { RiShoppingCartLine } from "react-icons/ri";
import HeaderBottom from "./headerBottom";
const Header = () => {
  return (
    <div className="w-full bg-white">
      <div className="container flex items-center justify-between py-2">
        <div>
          <Link href="/">
            <span className="text-3xl font-bold">
              <span className="text-blue-500">Shop</span>Bizz
            </span>
          </Link>
        </div>
        <div className="w-1/2 relative">
          <input
            type="text"
            placeholder="Search products here"
            name=""
            id=""
            className="border-blue-500 border-2 outline-none p-2 w-full "
          />
          <div className="absolute top-0 right-0 flex justify-center items-center w-10 h-full bg-blue-500   text-white">
            <CiSearch className="w-6 h-6 cursor-pointer" />
          </div>
        </div>
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
      </div>
      <div className="border-b border-b-[#f3f3f3]"></div>
      <HeaderBottom />
    </div>
  );
};

export default Header;
