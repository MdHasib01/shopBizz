"use client";

import Header from "@/components/header";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
const fetchOrders = async () => {
  const res = await axiosInstance("/order/api/get-admin-orders");
  return res.data.orders;
};

const page = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: any) => (
          <span className="text-foreground text-sm truncate">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-foreground text-sm">
            {row.original.shop?.name ?? "Guest"}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Buyer",
        cell: ({ row }: any) => (
          <span className="text-foreground text-sm">
            {row.original.user?.name ?? "Guest"}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: any) => (
          <span className="text-foreground text-sm">${row.original.total}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.status === "Paid"
                ? "bg-green-600 text-white"
                : row.original.status === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-foreground text-sm">{date}</span>;
        },
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <Link
            href={`/order/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    []
  );
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });
  return (
    <>
      <Header pageTitle="All Orders" />
      <div className="w-full min-h-screen p-8 bg-background text-foreground">
        {/* Search Bar */}
        <div className="my-4 flex items-center bg-card p-2 rounded-md">
          <Search size={18} className="text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none flex-1"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-card rounded-lg p-4">
          {isLoading ? (
            <p className="text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-3">No Orders found.</p>
          ) : (
            <table className="w-full text-foreground">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-3 text-left text-sm border-b border-border"
                      >
                        {header.isPlaceholder ? null : (
                          <div>{header.column.columnDef.header as string}</div>
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
                      <td key={cell.id} className="p-3 text-sm">
                        {cell.column.columnDef.cell
                          ? (cell.column.columnDef.cell as any)(
                              cell.getContext()
                            )
                          : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default page;
