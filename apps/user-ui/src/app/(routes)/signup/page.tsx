"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import GoogleButton from "@/components/ui/googleButton";
import { apiConfig } from "@/configs/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import axios, { Axios, AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { toast } from "sonner";
import { CiCircleAlert } from "react-icons/ci";
import ErrorAlert from "@/components/ui/errorAlert";
type FormData = {
  name: string;
  email: string;
  password: string;
};
const Page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  // For Otp
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length)
      inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = () => {
    setShowOtp(true);
    setCanResend(false);
    setTimer(60);
  };

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.signup}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
      toast.success("OTP has been sent to your email");
    },
  });
  // In your component
  useEffect(() => {
    if (signupMutation.isError && signupMutation.error instanceof AxiosError) {
      toast.error(
        signupMutation.error.response?.data?.message ||
          signupMutation.error?.message ||
          "Something went wrong"
      );
    }
  }, [signupMutation.isError]);
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.verifyOtp}`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };
  console.log(canResend, timer);
  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Sign up
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Signup
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Signup to <span className="text-blue-500">Shop</span>bizz
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?{" "}
            <Link href="/login">
              {" "}
              <span className="text-blue-500 cursor-pointer">Login</span>
            </Link>
          </p>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="name"
                placeholder="your name"
                className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {String(errors.name.message)}
                </p>
              )}
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="example@example.com"
                className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
                {...register("email", {
                  required: "Email is required",
                  pattern: /^\S+@\S+\.\S+$/,
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {String(errors.email.message)}
                </p>
              )}
              <label className="block text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="example@example.com"
                  className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <LuEye /> : <LuEyeClosed />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full disabled:bg-gray-700 disabled:text-gray-200 bg-black text-white py-2 rounded transition duration-300 mt-4"
              >
                {signupMutation.isPending ? "Signing up..." : "Sign up"}
              </button>
              {signupMutation.isError &&
                signupMutation.error instanceof AxiosError && (
                  <ErrorAlert
                    message={
                      signupMutation.error.response?.data?.message ||
                      signupMutation.error?.message ||
                      "Something went wrong"
                    }
                  />
                )}
            </form>
          ) : (
            <div>
              <h3 className="test-xl font-semibold text-center mb-4">
                Enter Otp
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    type="text"
                    key={index}
                    maxLength={1}
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[index] = el;
                      }
                    }}
                    className="w-12 h-12 text-center border border-gray-300 outline-none rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={verifyOtpMutation.isPending}
                className="w-full bg-blue-500 disabled:bg-blue-200 disabled:text-gray-200 text-white py-2 rounded transition duration-300 mt-4"
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending
                  ? "Verifying Otp..."
                  : " Verify Otp"}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    disabled={canResend}
                    className="text-blue-500 cursor-pointer"
                    onClick={handleResendOtp}
                  >
                    Resend Otp
                  </button>
                ) : (
                  <button>Resend Otp in {timer}s</button>
                )}
              </p>
              {verifyOtpMutation.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error?.message ||
                      "Something went wrong"}
                  </p>
                )}
            </div>
          )}

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-2">or Sign in with Google</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          <GoogleButton />
        </div>
      </div>
    </div>
  );
};
export default Page;
