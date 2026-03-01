import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const themeSettingsSchema = z.object({
  color: z.enum(["zinc", "rose", "blue", "green", "orange", "red"]),
  density: z.enum(["compact", "comfortable", "large"]),
  radius: z.enum(["0", "0.3", "0.5", "0.75", "1.0"]),
  navDrawerSide: z.enum(["left", "right"]).optional(),
});

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = themeSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid theme settings", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { color, density, radius, navDrawerSide } = result.data;
    const cookieOptions = { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" as const };

    const response = NextResponse.json({ success: true, data: result.data });
    response.cookies.set("themeColor", color, cookieOptions);
    response.cookies.set("density", density, cookieOptions);
    response.cookies.set("radius", radius, cookieOptions);
    if (navDrawerSide) {
      response.cookies.set("navDrawerSide", navDrawerSide, cookieOptions);
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to update theme settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const settings = {
      color: cookieStore.get("themeColor")?.value ?? "zinc",
      density: cookieStore.get("density")?.value ?? "comfortable",
      radius: cookieStore.get("radius")?.value ?? "0.5",
      navDrawerSide: cookieStore.get("navDrawerSide")?.value ?? "right",
    };

    return NextResponse.json({ data: settings });
  } catch {
    return NextResponse.json(
      { error: "Failed to read theme settings" },
      { status: 500 }
    );
  }
}
