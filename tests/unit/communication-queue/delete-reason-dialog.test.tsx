import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommunicationQueueDeleteReasonDialog } from "@/components/communication-queue/communication-queue-delete-reason-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

function renderDialog(onConfirm = vi.fn()) {
  render(
    <CommunicationQueueDeleteReasonDialog
      open
      onOpenChange={vi.fn()}
      description="communication_queue.delete_confirm_one"
      isPending={false}
      onConfirm={onConfirm}
    />,
  );
  return { onConfirm };
}

describe("CommunicationQueueDeleteReasonDialog", () => {
  // বার্তা পাঠানোর অপেক্ষমাণ তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not delete without a reason»।
  it("Delete reason dialog: does not delete without a reason", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: "communication_queue.delete_sms" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("communication_queue.delete_reason.errors.required");
  });

  // বার্তা পাঠানোর অপেক্ষমাণ তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends the trimmed reason»।
  it("Delete reason dialog: sends the trimmed reason", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.type(screen.getByLabelText(/communication_queue.delete_reason.label/), "  wrong number  ");
    await user.click(screen.getByRole("button", { name: "communication_queue.delete_sms" }));

    expect(onConfirm).toHaveBeenCalledWith("wrong number");
  });
});
