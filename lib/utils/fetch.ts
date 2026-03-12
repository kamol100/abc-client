"use server"
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import useToken from "../auth/auth-token";
const BASE_URL = process.env.NEXTAPI_URL;

export async function getPublicData(url: string) {
    const api_url = `${BASE_URL}${url}`;
    const result = await fetch(api_url, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    const data = result.json();
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
