import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientSpeedWidget from "@/components/clients/client-speed-widget";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({
  useFetch,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function renderWidget(props: { clientId?: string; url?: string }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ClientSpeedWidget {...props} />
    </QueryClientProvider>,
  );
}

describe("ClientSpeedWidget", () => {
  beforeEach(() => {
    useFetch.mockReset();
    useFetch.mockResolvedValue({
      success: true,
      data: { upload_speed: "1.20 MB", download_speed: "8.50 MB" },
    });
  });

  it("loads the signed-in client speed from the portal endpoint", async () => {
    renderWidget({ url: "client-dashboard-speed" });

    expect(await screen.findByText("1.20 MB")).toBeInTheDocument();
    expect(screen.getByText("8.50 MB")).toBeInTheDocument();
    expect(screen.getByLabelText("client.speed.upload")).toBeInTheDocument();
    expect(screen.getByLabelText("client.speed.download")).toBeInTheDocument();
    expect(useFetch).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/client-dashboard-speed" }),
    );
  });

  it("loads one client from the staff endpoint", async () => {
    renderWidget({ clientId: "client-uuid" });

    await screen.findByText("1.20 MB");
    expect(useFetch).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/clients-speed/client-uuid" }),
    );
  });

  it("shows placeholders when the session has no speed", async () => {
    useFetch.mockResolvedValue({
      success: true,
      data: { upload_speed: null, download_speed: null },
    });

    renderWidget({ url: "client-dashboard-speed" });

    await waitFor(() => {
      expect(screen.getAllByText("—")).toHaveLength(2);
    });
  });
});
