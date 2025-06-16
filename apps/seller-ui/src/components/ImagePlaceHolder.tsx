import { PencilIcon, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React from "react";

const ImagePlaceHolder = ({
  size,
  small,
  onImageChange,
  onRemove,
  setOpenImageModal,
  defaultImage = null,
  index = null,
}: {
  size: string;
  small?: boolean;
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  index?: any;
  setOpenImageModal?: (openImageModal: boolean) => void;
}) => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    defaultImage
  );
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      if (onImageChange) {
        onImageChange(file, index);
      }
    }
  };
  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-gray-200 dark:bg-[#1e1e1e] border-gray-600 rounded-lg flex flex-col justify-center items-center `}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index!)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setOpenImageModal?.(true);
            }}
            className="absolute top-3 right-[70px] p-2 !rounded bg-blue-600 shadow-lg cursor-pointer"
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          className="absolute top-3 right-3 p-2 !rounded bg-slate-600 dark:bg-slate-700 shadow-lg cursor-pointer"
          htmlFor={`image-upload-${index}`}
        >
          <PencilIcon size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="Product"
          width={400}
          height={300}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <>
          <p
            className={`text-gray-400 font-semibold ${
              small ? "text-xl" : "text-3xl"
            }`}
          >
            {size}
          </p>
          <p
            className={`text-gray-500 font-semibold ${
              small ? "text-sm" : "text-lg"
            } pt-2 text-center`}
          >
            please choose an image <br /> according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
