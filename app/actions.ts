"use server"
import { auth } from "@/auth/auth";
import { NextResponse } from "next/server";
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
    } catch (errors: any) {
        const { response = null } = errors;
        return NextResponse.json(
            { message: "Unable to insert data", error: response?.data },
            { status: response?.status ?? 500 }
        );
    }
}
type Props = {
    url: string;
    data?: any;
    method?: string;
    version?: string;
};

export async function useFetch({ url, data = null, method = "GET", version = "v1" }: Props) {
    try {
        const session: any = await auth();
        const token = session?.token;
        const api_url = `${BASE_URL}${version}${url}`;
        console.log(api_url, method, data)

        const options: RequestInit = {
            method: method,
            headers: {
                "Content-type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                Authorization: `Bearer ${token}`,
            },
        };

        if (data && (method === "POST" || method === "PUT" || method === "DELETE")) {
            options.body = JSON.stringify(data);
        }

        const result = await fetch(api_url, options);
        const responseData = await result.json();
        // console.log(responseData, "responseData");
        return responseData;
    } catch (errors: any) {
        const { response = null } = errors;
        return NextResponse.json(
            { message: "Unable to process request", error: response?.data },
            { status: response?.status ?? 500 }
        );
    }
}