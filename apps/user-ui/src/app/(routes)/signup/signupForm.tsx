import { useForm } from "react-hook-form";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import Link from "next/link";
import ErrorAlert from "@/components/ui/errorAlert";
import { SignUpFormData } from "@/types/auth/signup.types";

interface SignupFormProps {
  onSubmit: (data: SignUpFormData) => void;
  isLoading: boolean;
  serverError: string | null;
  passwordVisible: boolean;
  setPasswordVisible: (visible: boolean) => void;
}

const SignupForm = ({
  onSubmit,
  isLoading,
  serverError,
  passwordVisible,
  setPasswordVisible,
}: SignupFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();

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
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
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
          <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
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
          disabled={isLoading}
          className="w-full disabled:bg-gray-700 disabled:text-gray-200 bg-black text-white py-2 rounded transition duration-300 mt-4"
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
        {serverError && ErrorAlert({ message: serverError })}
      </form>
    </>
  );
};

export default SignupForm;
