export type NavItemsTypes = {
  name: string;
  href: string;
};
export const navItems: NavItemsTypes[] = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Products",
    href: "/products",
  },
  {
    name: "Shops",
    href: "/shops",
  },
  {
    name: "Offers",
    href: "/offers",
  },
  {
    name: "Become A Seller",
    href: `${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`,
  },
];
