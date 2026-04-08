"use server"
import { auth } from "@/auth/auth";
const BASE_URL = `${process.env.NEXTAPI_URL}/api/`;

export async function getData(url: string) {
    try {
        const session: any = await auth();
        const token = session?.token;
        const api_url = `${BASE_URL}${url}`;
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
    } catch (errors: unknown) {
        const errorRecord =
            typeof errors === "object" && errors !== null ? (errors as { response?: { data?: unknown; status?: number } }) : {};
        const response = errorRecord.response ?? null;

        return {
            success: false,
            message: "Unable to insert data",
            error: response?.data ?? null,
            status: response?.status ?? 500,
        };
    }
}
type Props = {
    url: string;
    data?: unknown;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    version?: string;
    token?: string;
};

export async function useFetch({ url, data = null, method = "GET", version = "v1", token: overrideToken }: Props) {
    try {
        const session: any = await auth();
        const token = overrideToken || session?.token;
        const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
        const normalizedVersion = version.trim();
        const api_url = `${BASE_URL}${normalizedVersion}${normalizedUrl}`;
        const isFormDataPayload = data instanceof FormData;

        const headers: HeadersInit = {
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${token}`,
        };
        if (!isFormDataPayload) {
            headers["Content-type"] = "application/json";
        }
        const options: RequestInit = {
            method: method,
            headers,
        };

        if (data !== null && data !== undefined && (method === "POST" || method === "PUT" || method === "DELETE")) {
            options.body = isFormDataPayload ? data : JSON.stringify(data);
        }

        const result = await fetch(api_url, options);
        const responseData = await result.json();
        // console.log(responseData, "responseData");
        return responseData;
    } catch (errors: unknown) {
        const errorRecord =
            typeof errors === "object" && errors !== null ? (errors as { response?: { data?: unknown; status?: number } }) : {};
        const response = errorRecord.response ?? null;

        return {
            success: false,
            message: "Unable to process request",
            error: response?.data ?? null,
            status: response?.status ?? 500,
        };
    }
}