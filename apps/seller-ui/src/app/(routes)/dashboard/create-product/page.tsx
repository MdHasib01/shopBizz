"use client";
import Header from "@/components/header";
import ImagePlaceHolder from "@/components/ImagePlaceHolder";
import { ChevronRight, Loader } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "../../../../components/input/input";
import ColorSelector from "../../../../components/color-selector";
import CustomSpecifications from "../../../../components/costom-specifications";
import CustomProperties from "../../../../components/custom-properties";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/rich-text-editor";
import SizeSelector from "@/components/size-selector";

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
  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });
  const categories = data?.categories || [];
  const subCategory = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategory[selectedCategory] : [];
  }, [selectedCategory, subCategory]);

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

  const handleSaveDraft = () => {};
  return (
    <>
      <Header pageTitle="Create Product" />
      <form
        className="w-full mx-auto p-8 shadow-md rounded-lg text-foreground"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl py-2 font-semibold text-foreground">
          Create Product
        </h2>
        <div className="flex items-center">
          <Link href="/dashboard">
            <span className="text-primary cursor-pointer">Dashboard</span>
          </Link>
          <ChevronRight size={20} className="opacity-[.8] text-foreground" />
          <span className="text-foreground">Create Product</span>
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
                    className="text-foreground"
                    placeholder="Enter product title"
                    type="text"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <span className="text-destructive">
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
                    <span className="text-destructive">
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
                    <span className="text-destructive">
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
                    <span className="text-destructive">
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
                    <span className="text-destructive">
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
                    <span className="text-destructive">
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
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Cash On delivery *
                  </label>
                  <select
                    {...register("cash_on_delivery", {
                      required: "This field is required",
                    })}
                    defaultValue={"yes"}
                    className="w-full border outline-none border-border bg-background rounded-md p-2 text-muted-foreground"
                  >
                    <option value="yes" className="bg-card">
                      Yes
                    </option>
                    <option value="no" className="bg-card">
                      No
                    </option>
                  </select>
                  {errors.cash_on_delivery && (
                    <span className="text-destructive">
                      {errors.cash_on_delivery.message as string}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-2/4 ">
                <label className="product-input-label">Category *</label>
                {isLoading ? (
                  <p className="text-muted-foreground">loading categories...</p>
                ) : isError ? (
                  <p className="text-destructive">Failed to load categories</p>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => {
                      console.log("Field object:", field);
                      console.log("Current value:", field.value);

                      return (
                        <Select
                          onValueChange={(val) => {
                            console.log("Changing to:", val);
                            field.onChange(val);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Categories</SelectLabel>
                              {categories?.map((category: string) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                )}
                {errors.category && (
                  <span className="text-destructive">
                    {errors.category.message as string}
                  </span>
                )}
                <label className="product-input-label mt-4">
                  Sub Categroies *
                </label>
                {isLoading ? (
                  <p className="text-muted-foreground">
                    loading sub categories...
                  </p>
                ) : isError ? (
                  <p className="text-destructive">
                    Failed to load sub categories
                  </p>
                ) : (
                  <Controller
                    name="subcategory"
                    control={control}
                    render={({ field }) => {
                      console.log("Field object:", field);
                      console.log("Current value:", field.value);

                      return (
                        <Select
                          onValueChange={(val) => {
                            console.log("Changing to:", val);
                            field.onChange(val);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a Sub Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Sub Categories</SelectLabel>
                              {subCategories?.map((category: string) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                )}
                {errors.subcategory && (
                  <span className="text-destructive">
                    {errors.subcategory.message as string}
                  </span>
                )}
                <div className="mt-4">
                  <label className="block font-semibold text-muted-foreground mb-1">
                    Description *
                  </label>
                  <Controller
                    name="detailed_description"
                    control={control}
                    rules={{
                      required: "Description is required",
                      validate: (value) => {
                        const wordCount = value.trim().split(/\s+/).length;
                        return (
                          wordCount <= 100 ||
                          "Description must be less than 100 words"
                        );
                      },
                    }}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter product description here..."
                      />
                    )}
                  />
                  {errors.detailed_description && (
                    <span className="text-destructive">
                      {errors.detailed_description.message as string}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <Input
                    label="Viduo Url"
                    type="text"
                    placeholder="https://www.youtube.com/embaded/xyz123"
                    {...register("video_url", {
                      pattern: {
                        value:
                          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                        message:
                          "Invalid url format!, use format like https://www.youtube.com/embaded/xyz123",
                      },
                    })}
                  />
                  {errors.video_url && (
                    <span className="text-destructive">
                      {errors.video_url.message as string}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <Input
                    label="Regular Price"
                    type="text"
                    placeholder="20$"
                    {...register("regular_price", {
                      valueAsNumber: true,
                      min: { value: 1, message: "Price must be at least 1" },
                      validate: (value) =>
                        !isNaN(value) || "Only numbers are allowed",
                    })}
                  />
                  {errors.regular_price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.regular_price.message as string}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <Input
                    label="Sale Price *"
                    placeholder="15$"
                    type="text"
                    {...register("sale_price", {
                      required: "Sale Price is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Sale Price must be at least 1",
                      },
                      validate: (value) => {
                        if (isNaN(value)) return "Only numbers are allowed";
                        if (regularPrice && value >= regularPrice) {
                          return "Sale Price must be less than Regular Price";
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.sale_price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.sale_price.message as string}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <Input
                    label="Stock *"
                    placeholder="100"
                    type="text"
                    {...register("stock", {
                      required: "Stock is required!",
                      valueAsNumber: true,
                      min: { value: 1, message: "Stock must be at least 1" },
                      max: {
                        value: 1000,
                        message: "Stock cannot exceed 1,000",
                      },
                      validate: (value) => {
                        if (isNaN(value)) return "Only numbers are allowed!";
                        if (!Number.isInteger(value))
                          return "Stock must be a whole number!";
                        return true;
                      },
                    })}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stock.message as string}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <SizeSelector control={control} errors={errors} />
                </div>

                <div className="mt-3">
                  <label className="block font-semibold text-foreground mb-1">
                    Select Discount Codes (optional)
                  </label>
                  {discountLoading ? (
                    <p>Loading discount codes...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {discountCodes?.map((code: any) => (
                        <button
                          type="button"
                          key={code.id}
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            watch("discountCodes")?.includes(code.id)
                              ? "bg-primary text-primary-foreground border border-border"
                              : "bg-muted text-primary-foreground border border-border"
                          }`}
                          onClick={() => {
                            const currentSelection =
                              watch("discountCodes") || [];
                            const updatedSelection = currentSelection?.includes(
                              code.id
                            )
                              ? currentSelection.filter(
                                  (id: string) => id !== code.id
                                )
                              : [...currentSelection, code.id];
                            setValue("discountCodes", updatedSelection);
                          }}
                        >
                          {code?.public_name} ({code.discountValue})
                          {code.discountType === "percentage" ? "%" : "$"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          {isChanged && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 duration-300"
            >
              Save Draft
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 duration-300"
          >
            {isLoading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </>
  );
};

export default page;
