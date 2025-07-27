import React from "react";
import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const SizeSelector = ({ control, errors }: any) => {
  return (
    <div>
      <label className="block font-semibold text-muted-foreground">
        Sizes*
      </label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size]
                    )
                  }
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border border-border"
                      : "bg-muted text-primary-foreground"
                  }`}
                >
                  {size}
                </button>
              );
            })}
            {errors.sizes && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sizes.message as string}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SizeSelector;
