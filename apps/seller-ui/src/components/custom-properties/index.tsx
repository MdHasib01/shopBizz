import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import Input from "../input/input";
import { LuPlus, LuX } from "react-icons/lu";
import { toast } from "sonner";
const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = React.useState<
    { label: string; values: string[] }[]
  >([]);

  const [newLabel, setNewLabel] = React.useState<string>("");
  const [newValue, setNewValue] = React.useState<string>("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name={`customProperties`}
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) {
                toast.error("Please enter a label.");
                return;
              }
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel("");
            };
            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue("");
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className="block font-semibold text-muted-foreground mb-1">
                  Custom Properties
                </label>
                <div className="flex flex-col gap-2">
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-border p-3 rounded-lg bg-secondary"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-card-foreground font-medium">
                          {property.label}
                        </span>
                        {
                          <button
                            type="button"
                            onClick={() => removeProperty(index)}
                          >
                            <LuX className="h-4 w-4 text-destructive" />
                          </button>
                        }
                      </div>

                      {/* Add value to property  */}
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          type="text"
                          placeholder="Enter value..."
                          className="border outline-none border-border bg-background p-2 rounded-md text-foreground w-full"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={() => addValue(index)}
                          className="px-3 py-2 bg-primary text-primary-foreground rounded-md"
                        >
                          Add
                        </button>
                      </div>

                      {/* Show vlues  */}
                      <div className="flex flex-wrap gap-2mt-2">
                        {property.values.map((value, valueIndex) => (
                          <span
                            key={valueIndex}
                            className="px-2 py-1 m-2 bg-primary text-muted-foreground rounded-md"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Add new property  */}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="text"
                      placeholder="Enter Property Label (e.g., Material)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addProperty}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md flex"
                    >
                      <LuPlus className="h-6 w-6" /> Add
                    </button>
                  </div>
                </div>
                {errors.customProperties && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.customProperties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
