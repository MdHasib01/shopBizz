import HeroSection from "@/components/HeroSection";
import SectionTitle from "@/components/SectionTitle";

const page = () => {
  return (
    <div className="">
      <HeroSection />
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="New Arrivals" />
        </div>
        {
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="w-full h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default page;
