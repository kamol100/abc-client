"use server"
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import useToken from "../auth/auth-token";
const BASE_URL = process.env.NEXTAPI_URL;

export default async function getData(url: string, ...args: any) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    console.log(token)
    //const session: any = await auth();
    //const api_url = `${BASE_URL}${url}`;
    const api_url = `${BASE_URL}${url}`;
    //const token = await useToken();
    console.log(BASE_URL, 'base_url');
    const result = await fetch("http://127.0.0.1:8000/api/v1/users", {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer 669|asGoy4uYWzOmZGboxBbjyRD8MV0ITWHWYl74i21J19ba1b2b`,
        },
    });
    const data = await result.json();
    console.log("server:data", data)
    return data;
}
export async function getPublicData(url: string, options: any = null) {
    let api_url = `${BASE_URL}${url}`;
    if (options === "translation") {
        api_url = `${process.env.NEXT_PUBLIC_TRANSLATION}${url}`;
    }
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