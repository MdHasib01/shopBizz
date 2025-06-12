"use client";
import ErrorAlert from "@/components/ui/errorAlert";
import useCreateShop from "@/hooks/create-seller/useCreateShop";
import { ShopFormData } from "@/types/shop/shop.types";
import { shopCategories } from "@/utils/shopCategories";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (activeStep: number) => void;
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopFormData>();

  const createShopMutaiton = useCreateShop(
    setServerError,
    setActiveStep,
    sellerId
  );

  const onSubmit = (data: ShopFormData) => {
    createShopMutaiton.mutate(data);
  };
  return (
    <>
      <h3 className="text-3xl font-semibold text-center mb-2">Setup Shop</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-gray-700 mb-1">Name*</label>
        <input
          type="name"
          placeholder="your name"
          className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
          {...register("name", {
            required: "Name is required",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        <label className="block text-gray-700 mb-1">
          Bio (Max 100 words) *
        </label>
        <textarea
          cols={10}
          rows={4}
          placeholder="shop Bio"
          className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
          {...register("bio", {
            required: "Bio is required",
            validate: (value) =>
              value.trim().length <= 100 || "Bio must be less than 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}

        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Mon-Fri 10AM - 6PM"
            className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
            {...register("opening_hours", {
              required: "Opening Hours is required",
            })}
          />
        </div>
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Address *</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Mon-Fri 10AM - 6PM"
            className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
            {...register("address", {
              required: "Address is required",
            })}
          />
        </div>
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Website</label>
        <input
          type="text"
          placeholder="example.com"
          className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
          {...register("website", {
            pattern: {
              value:
                /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
              message: "Enter a valid url",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Category</label>
        <select
          className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
          {...register("category", {
            required: "Category is required",
          })}
        >
          <option value="">Select a category</option>
          {shopCategories.map((category, index) => (
            <option key={index} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          disabled={createShopMutaiton?.isPending}
          className="w-full disabled:bg-gray-700 disabled:text-gray-200 bg-black text-white py-2 rounded transition duration-300 mt-4"
        >
          {createShopMutaiton?.isPending ? "Supping..." : "Submit"}
        </button>
        {serverError && ErrorAlert({ message: serverError })}
      </form>
    </>
  );
};

export default CreateShop;
