import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input/input";
import { LuTrash2 } from "react-icons/lu";
import { CiCirclePlus } from "react-icons/ci";

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });
  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1">
        Custom Specifications
      </label>
      <div className="flex flex-col gap-3">
        {fields.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Controller
              name={`custom_specifications.${index}.key`}
              control={control}
              rules={{ required: "Specification name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Specification name"
                  type="text"
                  placeholder="e.g., Battery Capacity, Size, etc."
                />
              )}
            />
            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="value"
                  type="text"
                  placeholder="e.g., 5000mAh, 6.5 inches, etc."
                />
              )}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              <LuTrash2 />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: "", value: "" })}
          className="flex items-center gap-2 text-blue-500"
        >
          <CiCirclePlus className="w-6 h-6" /> Add Specifications
        </button>
      </div>
      {errors.custom_specifications && (
        <p className="text-red-500 text-sm mt-1">
          {errors.custom_specifications.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;
