import "./global.css";
import Providers from "./providers";
// import { Poppins, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
export const metadata = {
  title: "ShopBizz",
  description: "A multi vendor ecommerce platform",
};

// const robot = Roboto({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"],
//   variable: "--font-roboto",
// });
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
//   variable: "--font-poppins",
// });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
