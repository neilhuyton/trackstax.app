import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useAuthStore } from "@/store/authStore"; // ← import real hook
import { renderWithProviders } from "../../utils/test-helpers";
import { APP_CONFIG } from "@/appConfig";
import type { User, Session } from "@supabase/supabase-js";

vi.mock("@/lib/supabase"); // if you have other mocks needed

describe("Authenticated Layout Route (/_authenticated)", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to a clean authenticated state (same as your working profile test)
    useAuthStore.setState({
      user: {
        id: "test-user",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      } as User,
      session: {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "test-user",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          role: "authenticated",
          created_at: new Date().toISOString(),
        } as User,
      } as Session,
      loading: false,
      error: null,
      isInitialized: true,
      lastRefreshFailed: false,
      initialize: vi.fn().mockResolvedValue(undefined),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  it("shows loading screen when loading is true", async () => {
    useAuthStore.setState({ loading: true });

    renderWithProviders({
      initialEntries: [APP_CONFIG.defaultAuthenticatedPath],
    });

    await waitFor(() => {
      expect(screen.getByText("Loading session...")).toBeInTheDocument();
    });
  });

  it("does not redirect immediately when loading is true", async () => {
    useAuthStore.setState({ loading: true });

    const { router } = renderWithProviders({
      initialEntries: [APP_CONFIG.defaultAuthenticatedPath],
    });

    await waitFor(() => {
      expect(screen.getByText("Loading session...")).toBeInTheDocument();
    });

    expect(router.state.location.pathname).not.toBe("/login");
  });

  it("renders ProfileIcon in the header when authenticated", async () => {
    renderWithProviders({
      initialEntries: [APP_CONFIG.defaultAuthenticatedPath],
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /profile/i }),
      ).toBeInTheDocument();
    });
  });

  it("navigates to /profile when ProfileIcon is clicked", async () => {
    const { router } = renderWithProviders({
      initialEntries: [APP_CONFIG.defaultAuthenticatedPath],
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /profile/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /profile/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/profile");
    });
  });
});
