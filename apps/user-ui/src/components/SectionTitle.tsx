import React from "react";

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div>
      <div className="relative">
        <div className="md:text-3xl text-xl relative z-10 font-semibold">
          {title}
        </div>
      </div>
    </div>
  );
};

export default SectionTitle;
