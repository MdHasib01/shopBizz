import "./global.css";
import Providers from "./providers";
import { Poppins, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "ShopBizz",
  description: "A multi vendor ecommerce platform",
};

const robot = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${robot.variable} ${poppins.variable}`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
