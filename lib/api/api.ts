
import useToken from "@/lib/auth/auth-token";
import { NextResponse } from "next/server";
import type { CompanyPublicData } from "@/types/company-public-type";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API ?? process.env.NEXTAPI_URL ?? ""
)
  .trim()
  .replace(/\/$/, "");
const BASE_URL = `${API_ORIGIN}/api/v1`;

export async function getData(url: string) {
    //const api_url = `${BASE_URL}${url}`;
    const api_url = `${BASE_URL}${url}`;
    const token = await useToken();
    console.log(token, api_url);
    const result = await fetch(api_url, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await result.json();
    return data;
}
export async function getPublicData(url: string) {
    const api_url = `${BASE_URL}${url}`;
    const result = await fetch(api_url, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    const data = await result.json();
    return data;
}

export async function getCompanyPublicData(host?: string | null): Promise<CompanyPublicData> {
    const hostname = host?.trim();
    const queryHost = hostname ? `?host=${encodeURIComponent(hostname)}` : "";
    const response = await getPublicData(`/company-data${queryHost}`);
    return (response?.data as CompanyPublicData) ?? {};
}
export async function postPublicData(url: string, formData: any) {
    const api_url = `${BASE_URL}${url}`;
    console.log(api_url, formData);
    const result = await fetch(api_url, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(formData),
    });
    const data = await result.json();
    return data;
}

export async function postData(url: string, formData: any) {
    const api_url = `${BASE_URL}${url}`;
    const token = await useToken();
    try {
        const result = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });
        const data = await result.json();
        return data;
    } catch (errors: any) {
        const { response = null } = errors;
        return NextResponse.json(
            { message: "Unable to insert data", error: response?.data },
            { status: response?.status ?? 500 }
        );
    }
}
export async function postFormData(url: string, formData: any) {
    const api_url = `${BASE_URL}${url}`;

    const token = await useToken();
    try {
        const result = await fetch(api_url, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
        const data = await result.json();
        // console.log(data, formData);
        return data;
    } catch (errors: any) {
        const { response = null } = errors;
        return NextResponse.json(
            { message: "Unable to insert data", error: response?.data },
            { status: response?.status ?? 500 }
        );
    }
}
export async function putData(url: string, formData: any) {
    const api_url = `${BASE_URL}${url}`;
    const token = await useToken();
    const result = await fetch(api_url, {
        method: "PUT",
        headers: {
            "Content-type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });
    const data = await result.json();
    return data;
}

export async function putFormData(url: string, formData: any) {
    const api_url = `${BASE_URL}${url}?_method=PUT`;
    const token = await useToken();
    const result = await fetch(api_url, {
        method: "POST",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await result.json();
    return data;
}

export async function deleteRecord(url: string) {
    const api_url = `${BASE_URL}${url}`;
    const token = await useToken();
    try {
        const result = await fetch(api_url, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = result.json();
        return data;
    } catch (errors: any) {
        const { response = null } = errors;
        return NextResponse.json(
            { message: "Unable to  delete", error: response?.data },
            { status: response?.status ?? 500 }
        );
    }
}
