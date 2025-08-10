"use client";
import Header from "@/components/header";
import ImagePlaceHolder from "@/components/ImagePlaceHolder";
import { ChevronRight, Loader, Wand, X, Save } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Controller, set, useForm } from "react-hook-form";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { enhancements } from "@/utils/AI.enhancement";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

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
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [pictureDeleteingLoader, setPictureDeleteingLoader] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [transformationHistory, setTransformationHistory] = useState<string[]>(
    []
  );
  const router = useRouter();
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

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", data);
      toast.success("Product created successfully");
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Utility function to check if ImageKit URL is valid
  const isImageKitUrl = (url: string) => {
    return url.includes("ik.imagekit.io");
  };

  // Utility function to test image loading
  const testImageLoad = (
    url: string,
    timeout: number = 10000
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => {
        reject(new Error("Image loading timeout"));
      }, timeout);

      img.onload = () => {
        clearTimeout(timer);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Failed to load transformed image"));
      };

      img.src = url;
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG and WebP files are allowed");
      return;
    }

    try {
      setPictureUploadingLoader(true);
      const fileName = await convertFileToBase64(file);

      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName },
        {
          timeout: 30000, // 30 second timeout
          onUploadProgress: (progressEvent) => {},
        }
      );

      const updatedImages = [...images];
      const uploadedImage = {
        file_url: response.data.file_url,
        fileId: response.data.fileId,
      };
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue(`images`, updatedImages);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      setPictureDeleteingLoader(true);
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete(`/product/api/delete-product-image`, {
          data: {
            fileId: imageToDelete.fileId!,
          },
        });
      }
      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue(`images`, updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureDeleteingLoader(false);
    }
  };

  // Enhanced transformation function with better error handling
  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;

    // Check if it's a valid ImageKit URL
    if (!isImageKitUrl(selectedImage)) {
      toast.error(
        "Image transformations are only available for ImageKit hosted images."
      );
      return;
    }

    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const baseUrl = originalImageUrl || selectedImage.split("?")[0];

      // For background removal and complex transformations, use smaller image first
      const isComplexTransform =
        transformation.includes("e-removedotbg") ||
        transformation.includes("e-upscale") ||
        transformation.includes("e-enhance");

      let finalTransform = transformation;
      if (isComplexTransform) {
        finalTransform = `w-800,h-600,${transformation}`;
      }

      const transformedUrl = `${baseUrl}?tr=${finalTransform}`;

      // Test the transformation with longer timeout for complex operations
      const timeout = isComplexTransform ? 25000 : 15000;
      await testImageLoad(transformedUrl, timeout);

      setSelectedImage(transformedUrl);
      setTransformationHistory((prev) => [...prev, transformation]);
    } catch (error) {
      console.error("Transformation failed:", error);

      // Try fallback without resizing for complex transforms
      if (transformation.includes("e-removedotbg")) {
        try {
          const baseUrl = originalImageUrl || selectedImage.split("?")[0];
          const fallbackUrl = `${baseUrl}?tr=${transformation}`;
          await testImageLoad(fallbackUrl, 30000); // Even longer timeout
          setSelectedImage(fallbackUrl);
          setTransformationHistory((prev) => [...prev, transformation]);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          toast.error(
            "Enhancement failed. The background removal service might be busy. Please try again in a few moments."
          );
          setActiveEffect(null);
        }
      } else {
        toast.error(
          "Enhancement failed. Please try a different effect or check your internet connection."
        );
        setActiveEffect(null);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Function to save enhanced image back to your images array
  const saveEnhancedImage = async () => {
    if (!selectedImage || selectedImage === originalImageUrl) {
      setOpenImageModal(false);
      return;
    }

    try {
      setProcessing(true);

      const currentImageIndex = images.findIndex(
        (img) => img && img.file_url.split("?")[0] === originalImageUrl
      );

      if (currentImageIndex !== -1) {
        const updatedImages = [...images];
        if (updatedImages[currentImageIndex]) {
          updatedImages[currentImageIndex] = {
            ...updatedImages[currentImageIndex]!,
            file_url: selectedImage,
          };
          setImages(updatedImages);
          setValue("images", updatedImages);
        }
      }

      setOpenImageModal(false);
      toast.success("Enhanced image saved successfully!");
    } catch (error) {
      console.error("Failed to save enhanced image:", error);
      toast.error("Failed to save enhanced image");
    } finally {
      setProcessing(false);
    }
  };

  // Handle image click to open modal
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOriginalImageUrl(imageUrl.split("?")[0]); // Store clean URL
    setOpenImageModal(true);
    setActiveEffect(null);
    setTransformationHistory([]);
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
                images={images}
                small={false}
                pictureUploadingLoader={pictureUploadingLoader}
                pictureDeleteingLoader={pictureDeleteingLoader}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
                setOpenImageModal={setOpenImageModal}
                setSelectedImage={handleImageClick}
                defaultImage={null}
                index={0}
              />
            )}

            <div className="grid grid-cols-2 gap-3 mt-4 ">
              {images.slice(1).map((_, index) => {
                return (
                  <ImagePlaceHolder
                    size="765 x 850"
                    images={images}
                    small={true}
                    pictureUploadingLoader={pictureUploadingLoader}
                    pictureDeleteingLoader={pictureDeleteingLoader}
                    onImageChange={handleImageChange}
                    onRemove={handleRemoveImage}
                    setOpenImageModal={setOpenImageModal}
                    setSelectedImage={handleImageClick}
                    defaultImage={null}
                    index={index + 1}
                    key={index}
                  />
                );
              })}
              {pictureUploadingLoader && <Loader className="animate-spin" />}
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
                    {...register("short_description", {
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
                  {errors.short_description && (
                    <span className="text-destructive">
                      {errors.short_description.message as string}
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
                      required: "Warranty information is required",
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
                    placeholder="product-slug-example"
                    {...register("slug", {
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
                  {errors.slug && (
                    <span className="text-destructive">
                      {errors.slug.message as string}
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
                      return (
                        <Select
                          onValueChange={(val) => {
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
                  Sub Categories *
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
                    name="subCategory"
                    control={control}
                    render={({ field }) => {
                      return (
                        <Select
                          onValueChange={(val) => {
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
                    label="Video Url"
                    type="text"
                    placeholder="https://www.youtube.com/embed/xyz123"
                    {...register("video_url", {
                      pattern: {
                        value:
                          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                        message:
                          "Invalid url format!, use format like https://www.youtube.com/embed/xyz123",
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
                    placeholder="20"
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
                    placeholder="15"
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

        {/* Enhanced Image Modal */}
        <AlertDialog open={openImageModal} onOpenChange={setOpenImageModal}>
          <AlertDialogContent className="max-w-2xl">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-semibold">Enhance Product Image</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenImageModal(false)}
                  disabled={processing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-center flex-col items-center max-w-[400px] mx-auto my-4">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Product image"
                    style={{
                      maxHeight: "400px",
                      maxWidth: "400px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image failed to load:", selectedImage);
                      // Fallback to original image if transformation fails
                      const originalUrl = selectedImage.split("?")[0];
                      e.currentTarget.src = originalUrl;
                    }}
                  />

                  {processing && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="bg-white/90 px-3 py-2 rounded-md flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {processing && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader className="h-4 w-4 animate-spin" />
                    {activeEffect?.includes("e-removedotbg")
                      ? "Removing background... This may take up to 30 seconds."
                      : "Applying enhancement..."}
                  </div>
                )}
              </div>

              {selectedImage && isImageKitUrl(selectedImage) && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-foreground text-sm font-semibold">
                    AI Enhancements
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-hidden">
                    {enhancements.map(({ label, effect }) => (
                      <button
                        key={effect}
                        onClick={() => applyTransformation(effect)}
                        disabled={processing}
                        className={`px-3 flex items-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          processing
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-muted/80"
                        } ${
                          activeEffect === effect
                            ? "bg-primary text-primary-foreground border border-primary shadow-md"
                            : "bg-muted text-foreground border border-border hover:bg-muted/80"
                        }`}
                      >
                        <Wand className="h-3 w-3" />
                        {processing && activeEffect === effect
                          ? "Processing..."
                          : label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {/* Reset button */}
                    <button
                      onClick={() => {
                        const originalUrl = selectedImage.split("?")[0];
                        setSelectedImage(originalUrl);
                        setActiveEffect(null);
                        setTransformationHistory([]);
                      }}
                      disabled={processing}
                      className="flex-1 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                      Reset to Original
                    </button>

                    {/* Save enhanced image button */}
                    {selectedImage !== originalImageUrl && (
                      <button
                        onClick={saveEnhancedImage}
                        disabled={processing}
                        className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Save className="h-3 w-3" />
                        Save Enhanced Image
                      </button>
                    )}
                  </div>

                  {transformationHistory.length > 0 && (
                    <div className="mt-3 p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        Applied enhancements: {transformationHistory.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedImage && !isImageKitUrl(selectedImage) && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> AI enhancements are only available
                    for images uploaded to ImageKit. Please upload your image
                    through the form to use these features.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-6 flex justify-end gap-3">
          {isChanged && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 duration-300 disabled:opacity-50"
              disabled={loading}
            >
              Save Draft
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 duration-300 disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default page;
