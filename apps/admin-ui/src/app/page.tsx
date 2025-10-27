"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Input from "@/components/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
type FormData = {
  email: string;
  password: string;
};
export default function Index() {
  const { register, handleSubmit } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-admin`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setServerError(errorMessage);
    },
  });
  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center ">
      <div className="md:w-[450px] pb-8 bg-slate-600 rounded-md shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-poppins">
            Welcome Admin
          </h1>
          <div className="mt-3">
            <Input
              label="Email"
              type="text"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
            ></Input>
          </div>
          <div className="mt-3">
            <Input
              label="Password"
              type="password"
              placeholder="password"
              {...register("password", { required: "Password is required" })}
            ></Input>
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-4 bg-blue-500 py-2 w-full text-white hover:bg-blue-600 duration-300 font-"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
          {serverError && (
            <p className="text-red-500 text-center mt-2">{serverError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
