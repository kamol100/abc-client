import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Logout() {
  return (
    <div
      onClick={async () => {
        await signOut({ redirectTo: "/login" });
      }}
    >
      <div className="flex gap-2">
        <LogOut />
        <div>Logout</div>
      </div>
    </div>
  );
}
