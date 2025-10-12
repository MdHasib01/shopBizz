"use client";

import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { countries } from "@/configs/countries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

type FormValues = {
  label: "Home" | "Work" | "Other";
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "",
      isDefault: false,
    },
  });

  const { mutate: addAddress } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/api/add-address", payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-address"] });
      setShowModal(false);
      reset();
    },
  });

  // get Address
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-address"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  const onSubmit = async (data: any) => {
    addAddress({
      ...data,
      isDefault: data?.isDefault === "true",
    });
  };
  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/api/delete-address/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-address"] });
    },
  });
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>
        <button
          className="flex items-center gap-1 text-sm text-blue-500 font-medium hover:underline"
          onClick={() => setShowModal(true)}
          type="button"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* address list  */}
      <div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading Address...</p>
        ) : !addresses || addresses?.length === 0 ? (
          <p className="text-sm text-gray-500">No address found</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 ">
            {addresses?.map((address: any) => (
              <div
                key={address.id}
                className="border border-gray-200 rounded-md p-4 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {address.label}- {address.name}
                    </p>
                    <p>
                      {address.street}, {address.city}, {address.zip},{" "}
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center text-xs cursor-pointer text-red-500 hover:underline"
                    onClick={() => deleteAddress.mutate(address.id)}
                  >
                    {" "}
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal  */}
      {showModal && (
        <div className="fixed flex inset-0 z-50 bg-black/30 justify-center items-center">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Address
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Controller
                name="label"
                control={control}
                rules={{ required: "Address type is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Address Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Address Type</SelectLabel>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label.message}</p>
              )}

              <Input
                placeholder="Name"
                className="w-full"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}

              <Input
                placeholder="Street"
                className="w-full"
                {...register("street", { required: "Street is required" })}
              />
              {errors.street && (
                <p className="text-sm text-red-500">{errors.street.message}</p>
              )}

              <Input
                placeholder="City"
                className="w-full"
                {...register("city", { required: "City is required" })}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}

              <Input
                placeholder="Zip"
                className="w-full"
                {...register("zip", { required: "Zip is required" })}
              />
              {errors.zip && (
                <p className="text-sm text-red-500">{errors.zip.message}</p>
              )}

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                      <SelectGroup>
                        <SelectLabel>Country</SelectLabel>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(v === "true")}
                    value={field.value?.toString() ?? ""}
                    defaultValue={field.value?.toString() ?? ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Set as default?" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                      <SelectGroup>
                        <SelectLabel>Default Address</SelectLabel>
                        <SelectItem value="true">Set As Default</SelectItem>
                        <SelectItem value="false">Not Default</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
