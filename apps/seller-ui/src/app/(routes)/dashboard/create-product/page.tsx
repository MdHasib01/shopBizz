"use client";
import Header from "@/components/header";
import ImagePlaceHolder from "@/components/ImagePlaceHolder";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../../../../packages/components/input/input";
import ColorSelector from "../../../../../../../packages/components/color-selector";
import CustomSpecifications from "../../../../../../../packages/components/costom-specifications";
import CustomProperties from "../../../../../../../packages/components/custom-properties";

const page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const onSubmit = (data: any) => {
    console.log(data);
  };
  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);

    setValue(`images`, updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      return updatedImages;
    });
    setValue("images", images);
  };
  return (
    <>
      <Header pageTitle="Create Product" />
      <form
        className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl py-2 font-semibold text-black dark:text-white">
          Create Product
        </h2>
        <div className="flex items-center">
          <Link href="/dashboard">
            <span className="text-blue-400 dark:text-[#80Deea] cursor-pointer">
              Dashboard
            </span>
          </Link>
          <ChevronRight
            size={20}
            className="opacity-[.8] text-black dark:text-white"
          />
          <span className="text-black dark:text-white">Create Product</span>
        </div>

        {/* content layout */}
        <div className="py-4 w-full flex flex-col md:flex-row gap-6">
          {/* left side - image upload section */}
          <div className="md:w-[35%]">
            {images?.length > 0 && (
              <ImagePlaceHolder
                size="765 x 850"
                small={false}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
                setOpenImageModal={setOpenImageModal}
                defaultImage={null}
                index={0}
              />
            )}

            <div className="grid grid-cols-2 gap-3 mt-4 ">
              {images.slice(1).map((_, index) => {
                return (
                  <ImagePlaceHolder
                    size="765 x 850"
                    small={true}
                    onImageChange={handleImageChange}
                    onRemove={handleRemoveImage}
                    setOpenImageModal={setOpenImageModal}
                    defaultImage={null}
                    index={index + 1}
                    key={index}
                  />
                );
              })}
            </div>
          </div>

          {/* Right side - form section */}
          <div className="md:w-[65%]">
            <div className="w-full flex gap-6">
              {/* product title input  */}
              <div className="w-2/4">
                <div className="mt-2">
                  <Input
                    label="Product Title"
                    placeholder="Enter product title"
                    type="text"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <span className="text-red-500">
                      {errors.title.message as string}
                    </span>
                  )}
                </div>

                <div className="t-2">
                  <Input
                    label="Short Description * (Max 150 words)"
                    placeholder="Enter product description for quick view"
                    type="textarea"
                    rows={7}
                    cols={10}
                    {...register("description", {
                      required: "Description is required",
                      validate: (value) => {
                        const wordCount = value.trim().split(/\s+/).length;
                        return (
                          wordCount <= 150 ||
                          "Description must be less than 150 words"
                        );
                      },
                    })}
                  />
                  {errors.description && (
                    <span className="text-red-500">
                      {errors.description.message as string}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Tags *"
                    type="text"
                    placeholder="Apple, Flagship "
                    {...register("tags", {
                      required: "Seperate tags by commas",
                    })}
                  />
                  {errors.tags && (
                    <span className="text-red-500">
                      {errors.tags.message as string}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Warranty *"
                    type="text"
                    placeholder="1 Year / No Warranty"
                    {...register("warranty", {
                      required: "Seperate tags by commas",
                    })}
                  />
                  {errors.warranty && (
                    <span className="text-red-500">
                      {errors.warranty.message as string}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Slug *"
                    type="text"
                    placeholder="Slug"
                    {...register("warranty", {
                      required: "Slug is required!",
                      pattern: {
                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message:
                          "Invalid slug format! Use only lowercase letters, numbers, and hyphens.",
                      },
                      minLength: {
                        value: 3,
                        message: "Slug must be at least 3 characters long.",
                      },
                      maxLength: {
                        value: 50,
                        message: "Slug cannot exceed 50 characters.",
                      },
                    })}
                  />
                  {errors.warranty && (
                    <span className="text-red-500">
                      {errors.warranty.message as string}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Brand"
                    type="text"
                    placeholder="Apple"
                    {...register("brand")}
                  />
                  {errors.brand && (
                    <span className="text-red-500">
                      {errors.brand.message as string}
                    </span>
                  )}
                </div>
                <ColorSelector control={control} errors={errors} />
                <div className="mt-2">
                  <CustomSpecifications control={control} errors={errors} />
                </div>
                <div className="mt-2">
                  <CustomProperties control={control} errors={errors} />
                </div>
                <div className="mt-2">
                  <label className="block text-gray-600 dark:text-gray-300 font-semibold mb-1">
                    Cash On delivery *
                  </label>
                  <select
                    {...register("cash_on_delivery", {
                      required: "This field is required",
                    })}
                    defaultValue={"yes"}
                    className="w-full border outline-none border-grey-700 bg-transparent rounded-md p-2 text-gray-300 "
                  >
                    <option value="yes" className="bg-black">
                      Yes
                    </option>
                    <option value="no" className="bg-black">
                      No
                    </option>
                  </select>
                  {errors.cash_on_delivery && (
                    <span className="text-red-500">
                      {errors.cash_on_delivery.message as string}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-2/4">
                <label className="product-input-label">Category *</label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default page;
