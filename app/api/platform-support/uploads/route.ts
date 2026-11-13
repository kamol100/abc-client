import { proxySupportUpload } from "@/lib/platform-support/attachment-proxy";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxySupportUpload(request, "requester");
}
