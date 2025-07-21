"use client";
import { Controller } from "react-hook-form";
import React, { useState } from "react";
import { LuPlus } from "react-icons/lu";

const defaultColours = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#9400D3",
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#000000");
  return (
    <div className="mt-2">
      <label className="block font-semibold text-grey-300 mb-1"></label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-3">
            {[...defaultColours, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ["#ffffff", "#FF7F00", "#FFFF00"].includes(
                color
              );
              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transation ${
                    isSelected
                      ? "scale-110 border-border"
                      : "border-transparent"
                  } ${isLightColor ? "border-gray-600" : ""}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}
            {/* add new color */}
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 hover:text-gray-500 bg-gray-200 hover:bg-gray-300 dark:hover:text-gray-400 border-grey-500   dark:bg-gray-800 dark:hover:bg-gray-700 transation"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <LuPlus className="w-6 h-6" />
            </button>
            {/* colour picker   */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-0 border-none coursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      ></Controller>
    </div>
  );
};

export default ColorSelector;
