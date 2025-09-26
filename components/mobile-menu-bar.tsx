import { GalleryVerticalEnd, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

const MobileMenuBar: FC = () => {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const router = useRouter();
  return (
    <div className="flex w-full justify-between gap-4 bg-background border-t border-border p-4">
      <Button
        variant={segment === "clients" ? "default" : "outline"}
        className="rounded-md flex-1"
        onClick={() => router.push("/clients")}
      >
        <Users />
      </Button>
      <Button className="rounded-md flex-1" onClick={() => console.log("test")}>
        User
      </Button>
      <Button className="rounded-md flex-1">User</Button>
      <Button className="rounded-md flex-1">User</Button>
      <Button
        className="rounded-md flex-1 flex justify-center items-center z-50"
        onClick={() => {
          toggleSidebar();
        }}
      >
        <GalleryVerticalEnd />
      </Button>
    </div>
  );
};

export default MobileMenuBar;
