"use client";
import Header from "@/components/header";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Inbox, Plus, Trash } from "lucide-react";
import React, { use, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const createDiscountMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post(
        "/product/api/create-discount-code",
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    },
  });

  const handleDeleteClick = async (discount: any) => {};

  const formSubmit = (data: any) => {
    console.log("SUBMIT!", data);
    if (discountCodes.length >= 8) {
      toast.error("You can't add more than 8 discount codes");
      return;
    } else {
      createDiscountMutation.mutate(data);
    }
  };

  // Add this for debugging
  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("Form submit event triggered");
    e.preventDefault();
    handleSubmit(formSubmit)(e);
  };

  return (
    <>
      <Header pageTitle="Discount Codes" />
      <div className="w-full min-h-screen p-8">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl text-foreground font-semibold">
            Discount Codes
          </h2>
          <button
            className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 flex items-center"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} className="mr-2" /> Add Discount Code{" "}
          </button>
        </div>
        <div className="mt-8 bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Your Discount Codes
          </h3>
          {isLoading ? (
            <p className="text-muted text-center">Loading...</p>
          ) : (
            <table className="w-full text-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes?.map((discount: any) => {
                  return (
                    // Added missing return statement
                    <tr
                      key={discount._id}
                      className="border-b border-border hover:bg-background transition"
                    >
                      <td className="p-3">{discount.public_name}</td>
                      <td className="p-3 capitalize">
                        {discount.discountType === "percentage"
                          ? "Percentage (%)"
                          : "Flat ($)"}
                      </td>
                      <td className="p-3">{discount.discountValue}</td>
                      <td className="p-3">{discount.discountCode}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteClick(discount)}
                          className="text-destructive hover:text-destructive/80 transition"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!isLoading && discountCodes.length === 0 && (
            <p className="text-muted text-center mt-6 w-full justify-center gap-2 flex items-center">
              <Inbox size={18} />
              No discount codes found
            </p>
          )}
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
              <DialogDescription>Add a new discount code</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label>Title (Public Name)</Label>
                <Input
                  {...register("public_name", {
                    required: "Title is required",
                  })}
                  placeholder="Enter title"
                />
                {errors.public_name && (
                  <span className="text-destructive">
                    {errors.public_name.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name-1">Discount Type</Label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountType && (
                  <span className="text-destructive">
                    {errors.discountType.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                <Label>Discount Value</Label>
                <Input
                  {...register("discountValue", {
                    required: "discount value is required",
                  })}
                  type="number"
                  placeholder="Enter discount value"
                />
                {errors.discountValue && (
                  <span className="text-destructive">
                    {errors.discountValue.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                <Label>Discount Code</Label> {/* Fixed label */}
                <Input
                  {...register("discountCode", {
                    required: "discount code is required",
                  })}
                  placeholder="Enter discount code"
                />
                {errors.discountCode && (
                  <span className="text-destructive">
                    {errors.discountCode.message}
                  </span>
                )}
              </div>
            </div>
            {createDiscountMutation.isError && (
              <span className="text-destructive">
                {createDiscountMutation.error?.message}
              </span>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                disabled={createDiscountMutation.isPending}
                type="button"
                onClick={handleSubmit(formSubmit)}
              >
                {createDiscountMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Page;
