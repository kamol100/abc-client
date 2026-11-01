import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readThemeSettings, themeSettingsSchema } from "@/lib/theme/theme-settings";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const cookieOptions = { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" as const };

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = themeSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid theme settings", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const settings = result.data;
    const response = NextResponse.json({ success: true, data: settings });
    response.cookies.set("themeColor", settings.color, cookieOptions);
    response.cookies.set("density", settings.density, cookieOptions);
    response.cookies.set("radius", settings.radius, cookieOptions);
    response.cookies.set("navDrawerSide", settings.navDrawerSide, cookieOptions);
    response.cookies.set("themePrefs", JSON.stringify(settings), cookieOptions);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to update theme settings" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { settings } = readThemeSettings({
      themeColor: cookieStore.get("themeColor")?.value,
      density: cookieStore.get("density")?.value,
      radius: cookieStore.get("radius")?.value,
      navDrawerSide: cookieStore.get("navDrawerSide")?.value,
      themePrefs: cookieStore.get("themePrefs")?.value,
      themeMode: cookieStore.get("themeMode")?.value,
    });

    return NextResponse.json({ data: settings });
  } catch {
    return NextResponse.json(
      { error: "Failed to read theme settings" },
      { status: 500 },
    );
  }
}
