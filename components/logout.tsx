import { signOut } from "@/auth/auth";
import { Button } from "./ui/button";

export default function Logout() {
  return (
    <Button
      onClick={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      Logout
    </Button>
  );
}
