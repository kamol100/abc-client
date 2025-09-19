import { GalleryVerticalEnd } from "lucide-react";
import { FC } from "react";
import { useSidebar } from "./ui/sidebar";

const MobileMenuBar: FC = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <div className="flex w-full justify-between gap-4  bg-white border-t p-4">
      <div className="p-1.5 bg-primary rounded flex-1 text-white">User</div>
      <div className="p-1.5 bg-primary rounded flex-1 text-white">User</div>
      <div className="p-1.5 bg-primary rounded flex-1 text-white">User</div>
      <div className="p-1.5 bg-primary rounded flex-1 text-white">User</div>
      <div
        className="p-1.5 bg-primary rounded flex-1 text-white flex justify-center items-center"
        onClick={() => toggleSidebar()}
      >
        <GalleryVerticalEnd />
      </div>
    </div>
  );
};

export default MobileMenuBar;
