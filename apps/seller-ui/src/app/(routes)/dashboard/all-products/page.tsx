"use client";
import Header from "@/components/header";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import DeleteConfirmationModal from "@/components/delete-confirmation-modal";
import { set } from "react-hook-form";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res?.data?.products || [];
};

const deleteProduct = async (id: any) => {
  await axiosInstance.delete(`/product/api/delete-product/${id}`);
};
const restoreProduct = async (id: any) => {
  await axiosInstance.put(`/product/api/restore-product/${id}`);
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUnselectedOnly, setShowUnselectedOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      // setShowDeleteModal(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      // setShowDeleteModal(false);
    },
  });
  useEffect(() => {
    if ((deleteMutation.isSuccess || restoreMutation.isSuccess) && !isLoading) {
      // Reset mutation states
      deleteMutation.reset();
      restoreMutation.reset();
      setShowDeleteModal(false);
    }
  }, [deleteMutation.isSuccess, restoreMutation.isSuccess, isLoading]);
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images[0].url}
            alt={row.original.images[0].url}
            width={48}
            height={48}
            className="w-12 h-12 rounded-md object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className=" text-primary hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => {
          return (
            <span className="text-foreground font-semibold">
              ${row.original.sale_price}
            </span>
          );
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => {
          return (
            <span
              className={`${
                row.original.stock < 1 ? "text-destructive" : "text-foreground"
              }  font-semibold`}
            >
              {row.original.stock}
            </span>
          );
        },
      },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1  text-yellow-400">
            <Star fill="#fde047" size={18} />{" "}
            <span className=" text-foreground">
              {row.original.ratings || 5}
            </span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`/product/${row.original.id}`}
              className=" text-blue-400  hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/product/edit/${row.original.id}`}
              className=" text-yellow-400  hover:text-yellow-300 transition"
            >
              <Pencil size={18} />
            </Link>
            <button className=" text-green-400  hover:text-green-300 transition">
              <BarChart size={18} />
            </button>
            <button
              className=" text-red-400  hover:text-red-300 transition"
              onClick={() => {
                setShowDeleteModal(true);
                setSelectedProduct(row.original);
              }}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <Header pageTitle="All Products" />
      <div className="w-full mx-auto p-8  rounded-lg text-foreground">
        <h2 className="text-2xl py-2 font-semibold text-foreground">
          All Products
        </h2>
        <div className="flex items-center">
          <Link href="/dashboard">
            <span className="text-primary cursor-pointer">Dashboard</span>
          </Link>
          <ChevronRight size={20} className="opacity-[.8] text-foreground" />
          <span className="text-foreground">All Products</span>
        </div>
        <div className="mb-4 flex items-center max-h-12 mt-4 bg-card p-2 rounded-md flex-1">
          <Search size={18} className=" text-card-foreground mr-2" />
          <input
            type="text"
            placeholder="Search products ..."
            className="w-full bg-transparent  text-card-foreground outline-none"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* Table  */}
        <div className="overflow-x-auto bg-card rounded-lg p-4">
          {isLoading ? (
            <p className="text-center text-foreground">Loading products ...</p>
          ) : (
            <table className="w-full text-foreground">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-border">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="p-3 text-left">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:bg-muted transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <DeleteConfirmationModal
            product={selectedProduct}
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
            isDeleting={deleteMutation.isPending}
            isRestoring={restoreMutation.isPending}
          />
        </div>
      </div>
    </>
  );
};

export default ProductList;
