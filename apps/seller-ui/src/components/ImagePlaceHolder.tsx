import { Loader, PencilIcon, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React from "react";

const ImagePlaceHolder = ({
  size,
  images,
  small,
  pictureUploadingLoader,
  pictureDeleteingLoader,
  onImageChange,
  onRemove,
  setOpenImageModal,
  setSelectedImage,
  defaultImage = null,
  index = null,
}: {
  size: string;
  images: any;
  small?: boolean;
  pictureUploadingLoader?: boolean;
  pictureDeleteingLoader?: boolean;
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  index?: any;
  setOpenImageModal?: (openImageModal: boolean) => void;
  setSelectedImage?: (selectedImage: string) => void;
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
      } w-full cursor-pointer rounded-lg flex flex-col justify-center items-center`}
      style={{
        backgroundColor: "var(--muted)",
        borderColor: "var(--border)",
        border: "1px solid",
      }}
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
            disabled={pictureDeleteingLoader}
            onClick={() => onRemove?.(index!)}
            className="absolute top-3 right-3 p-2 !rounded shadow-lg disabled:cursor-default disabled:bg-muted! cursor-pointer"
            style={{
              backgroundColor: "var(--destructive)",
              color: "var(--destructive-foreground)",
            }}
          >
            {pictureDeleteingLoader ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <X size={16} />
            )}
          </button>
          <button
            type="button"
            disabled={pictureUploadingLoader}
            onClick={() => {
              setOpenImageModal?.(true);
              setSelectedImage?.(images[index].file_url);
            }}
            className="absolute top-3 right-[70px] p-2 !rounded disabled:bg-muted! disabled:cursor-default shadow-lg cursor-pointer"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          className="absolute top-3 right-3 p-2 !rounded shadow-lg cursor-pointer"
          htmlFor={`image-upload-${index}`}
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
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
            className={`font-semibold ${small ? "text-xl" : "text-3xl"}`}
            style={{ color: "var(--muted-foreground)" }}
          >
            {size}
          </p>
          <p
            className={`font-semibold ${
              small ? "text-sm" : "text-lg"
            } pt-2 text-center`}
            style={{ color: "var(--muted-foreground)", opacity: 0.8 }}
          >
            please choose an image <br /> according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
