"use client";

import MyButton from "@/components/my-button";
import { useCompany } from "@/context/company-provider";
import { CLIENT_LOGIN_PATH } from "@/lib/auth/routes";

export default function ClientHome() {
    const { company, logoUrl } = useCompany();
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <img src={logoUrl} alt={company.name ?? ""} className="h-10 w-auto object-contain" />
            <h1 className="text-2xl font-bold">Welcome to {company.name ?? "Client Home"}</h1>
            <div className="flex w-full max-w-xs flex-col gap-3">
                <MyButton
                    url={CLIENT_LOGIN_PATH}
                    title="login.submit"
                    icon={false}
                    variant="default"
                    size="default"
                    className="w-full"
                />
                <MyButton
                    url="/pay"
                    title="pay.quick_pay"
                    icon={false}
                    variant="outline"
                    size="default"
                    className="w-full"
                />
            </div>
        </div>
    );
}
