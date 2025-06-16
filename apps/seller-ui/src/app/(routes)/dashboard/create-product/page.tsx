"use client";
import Header from "@/components/header";
import ImagePlaceHolder from "@/components/ImagePlaceHolder";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../../../../packages/components/input/input";

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
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default page;
