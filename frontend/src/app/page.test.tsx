import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/i18n/locale-provider";

import LandingPage from "./page";

function renderLanding() {
  return render(
    <LocaleProvider>
      <LandingPage />
    </LocaleProvider>,
  );
}

// covers: PLAT-008, AC-000-10, BR-6.2
describe("Landing page", () => {
  it("shows the English headline by default", () => {
    renderLanding();
    expect(
      screen.getByRole("heading", { level: 1, name: /build your real estate career/i }),
    ).toBeInTheDocument();
  });

  it("links to the app download section and staff sign-in", () => {
    renderLanding();
    expect(screen.getByRole("link", { name: /get the elsakka app/i })).toHaveAttribute("href", "#download");
    expect(screen.getByRole("link", { name: /staff sign in/i })).toHaveAttribute("href", "/login");
  });

  it("switches to Arabic and right-to-left", () => {
    renderLanding();
    fireEvent.click(screen.getByRole("button", { name: /language/i }));
    expect(screen.getByRole("heading", { level: 1, name: "ابنِ مسيرتك العقارية مع وكالة محترفة" })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
  });
});
