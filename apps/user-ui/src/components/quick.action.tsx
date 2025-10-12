import React from "react";

const QuickActions = ({ Icon, title, description }: any) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-md border-gray-100 flex items-start gap-4 cursor-pointer">
      <Icon className="w-8 h-8 text-blue-500 mt-1" />
      <div>
        <h3 className="text-sm text-gray-800 font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-500 ">{description}</p>
      </div>
    </div>
  );
};

export default QuickActions;
