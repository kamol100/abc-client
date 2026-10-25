import { proxyPrivateImage } from "@/lib/images/proxy-private-image";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; field: string }> },
) {
  const { id, field } = await context.params;
  return proxyPrivateImage("resellers", id, field);
}
