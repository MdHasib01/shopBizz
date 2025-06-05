import "./global.css";
import Header from "./shared/widgets/header/header";
import { Poppins, Roboto } from "next/font/google";

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
        <Header />
        {children}
      </body>
    </html>
  );
}
