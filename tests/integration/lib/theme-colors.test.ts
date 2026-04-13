import setGlobalColorTheme from "@/lib/theme-colors";

describe("setGlobalColorTheme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
  });

  it("applies light theme color variables from API response", async () => {
    await setGlobalColorTheme("light", "Blue");

    expect(
      document.documentElement.style.getPropertyValue("--primary"),
    ).toContain("221.2 83.2% 53.3%");
    expect(
      document.documentElement.style.getPropertyValue("--background"),
    ).toContain("0 0% 100%");
  });

  it("applies dark theme color variables from API response", async () => {
    await setGlobalColorTheme("dark", "Blue");

    expect(
      document.documentElement.style.getPropertyValue("--primary"),
    ).toContain("217.2 91.2% 59.8%");
    expect(
      document.documentElement.style.getPropertyValue("--background"),
    ).toContain("222.2 84% 4.9%");
  });
});
