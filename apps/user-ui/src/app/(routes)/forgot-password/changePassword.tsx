import { useForm } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import Link from "next/link";
import ErrorAlert from "@/components/ui/errorAlert";
import {
  ChangePasswordForm,
  ForgotPasswordSubmitForm,
} from "@/types/auth/forgotPassword.types";
import { LuEye, LuEyeClosed } from "react-icons/lu";

interface ForgotPasswordFormProps {
  onSubmit: (data: ChangePasswordForm) => void;
  isLoading: boolean;
  serverError: string | null;
  passwordVisible: boolean;
  setPasswordVisible: (visible: boolean) => void;
}

const ChangePassword = ({
  onSubmit,
  isLoading,
  serverError,
  passwordVisible,
  setPasswordVisible,
}: ForgotPasswordFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>();

  return (
    <>
      <h3 className="text-3xl font-semibold text-center mb-2">
        Signup to <span className="text-blue-500">Shop</span>bizz
      </h3>
      <p className="text-center text-gray-500 mb-4">
        Already have an account?{" "}
        <Link href="/login">
          <span className="text-blue-500 cursor-pointer">Login</span>
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-gray-700 mb-1">New Password</label>
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="password"
            className="w-full p-2 border border-gray-300 rounded mb-1 outline-0"
            {...register("newPassword", {
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
        {errors.newPassword && (
          <p className="text-red-500 text-sm">
            {String(errors.newPassword.message)}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full disabled:bg-gray-700 disabled:text-gray-200 bg-black text-white py-2 rounded transition duration-300 mt-4"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <CgSpinner className="animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </button>
        {serverError && ErrorAlert({ message: serverError })}
      </form>
    </>
  );
};

export default ChangePassword;
