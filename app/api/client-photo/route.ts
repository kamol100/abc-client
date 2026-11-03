import { proxySessionImage } from "@/lib/images/proxy-private-image";

export async function GET() {
  return proxySessionImage("/api/v1/client-photo");
}
