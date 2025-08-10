import { MoveRight } from "lucide-react";

const HeroSection = () => {
  const handleShopClick = () => {
    // router.push("/products") - navigation logic would go here
    console.log("Navigate to products");
  };

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span>
            this week
          </p>
          <br />
          <button className="w-[140px] gap-2 font-semibold h-[40px] hover:text-white flex items-center justify-center bg-white text-black rounded transition-colors duration-300 hover:bg-transparent hover:border hover:border-white">
            Shop Now <MoveRight />
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://ik.imagekit.io/shopbizz/products/smartwatch-removebg-preview.png?updatedAt=1754796357903"
            alt=""
            width={450}
            height={450}
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
