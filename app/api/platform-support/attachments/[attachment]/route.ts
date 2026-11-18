import { proxySupportAttachment } from "@/lib/platform-support/attachment-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ attachment: string }> },
) {
  const { attachment } = await context.params;
  return proxySupportAttachment("requester", attachment);
}
