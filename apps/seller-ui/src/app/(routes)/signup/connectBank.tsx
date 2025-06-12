import { apiConfig } from "@/configs/apiRoutes";
import axios from "axios";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { toast } from "sonner";

const ConnectBank = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (activeStep: number) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const connectStripe = async () => {
    try {
      const response = await axios.post(
        apiConfig.baseUrl + apiConfig.routes.stripe,
        { sellerId }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
      toast.success("Stripe connect successfuly");
    } catch (error) {
      console.error(error);
      toast.error("Something went worng");
    }
  };
  return (
    <>
      <div className="text-center">
        <h2 className="font-semibold text-2xl">Withdraw Method</h2>
        <button
          disabled={loading}
          className="w-full m-auto disabled:[rgb(99,125,161)] cursor-pointer items-center justify-center gap-3 text-lg bg-[#637da1] text-white py-2 rounded-lg mt-4"
          onClick={connectStripe}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <CgSpinner className="animate-spin" />
              Connecting stripe...
            </span>
          ) : (
            "Connect Stripe"
          )}
        </button>
      </div>
    </>
  );
};

export default ConnectBank;
