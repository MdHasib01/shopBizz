import { activeSidebarItem } from "@/configs/constans";
import { useAtom } from "jotai";
import { usePathname } from "next/navigation";
import useAdmin from "./useAdmin";

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);
  const pathname = usePathname();
  const { admin } = useAdmin();
  const getIconColor = (route: String) =>
    activeSidebar === route ? "#0085ff" : "#969696";
  return { activeSidebar, setActiveSidebar };
};
export default useSidebar;
