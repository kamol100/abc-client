import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const filePath = path.join(process.cwd(), "data", "theme-settings.json");

export async function PUT(request: Request) {
    try {
        const form = await request.json();
        const data = await fs.readFile(filePath, "utf-8");
        const json = JSON.parse(data);

        json["colors"][form?.target]["light"][form?.key] = form.value;
        await fs.truncate(filePath, 0); // Clears the file
        await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");

        return NextResponse.json({ message: "Updated successfully", data: json });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update JSON" }, { status: 500 });
    }
}
export async function GET(request: Request) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        const json = JSON.parse(data);

        await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");

        return NextResponse.json({ message: "Get successfully", data: json });
    } catch (error) {
        return NextResponse.json({ error: "Failed to  JSON" }, { status: 500 });
    }
}
