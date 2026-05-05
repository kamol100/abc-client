"use client";
import { useCompany } from "@/context/company-provider";

export default function ClientHome() {
    const { company, logoUrl } = useCompany();
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <img src={logoUrl} alt={company.name ?? ""} className="h-10 w-auto object-contain" />
            <h1 className="text-2xl font-bold">Welcome to {company.name ?? "Client Home"}</h1>
        </div>
    );
}