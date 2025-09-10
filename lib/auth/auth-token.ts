
//import { options } from "../../app/api/auth/[...nextauth]/options";
import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";

const useToken = async () => {
    const session: any = await auth();
    if (!session) {
        return redirect('/login')
    }
    if (session?.token && session?.token !== undefined) {
        return session?.token;
    }
    return redirect('/login')
}

export default useToken;