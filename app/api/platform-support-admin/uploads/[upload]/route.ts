import { proxySupportDelete } from "@/lib/platform-support/attachment-proxy";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ upload: string }> },
) {
  const { upload } = await context.params;
  return proxySupportDelete(request, "platform", upload);
}
