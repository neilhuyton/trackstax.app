import {
  createFileRoute,
  redirect,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Suspense } from "react";
import {
  ActionBanner,
  ColorThemeSelector,
  ProfileIcon,
  ThemeToggle,
} from "@steel-cut/steel-lib";
import FullscreenButton from "@/features/screen/FullscreenButton";
import OrientationLock from "@/features/screen/OrientationLock";
import { APP_CONFIG } from "@/appConfig";

const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuthStore();
  const isExactStacksList = location.pathname === "/stacks";

  useEffect(() => {
    if (!user && !loading) {
      navigate({
        to: "/login",
        search: { redirect: window.location.pathname },
      });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading session...
      </div>
    );
  }

  const handleProfileClick = () => {
    navigate({ to: "/profile" });
  };

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <div className="flex flex-col h-screen overscroll-none bg-background">
        {isExactStacksList && (
          <header className="fixed top-0 left-0 right-0 z-30 bg-background px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b">
            <div className="text-xl font-semibold tracking-tight flex items-center gap-2.5">
              {APP_CONFIG.appName}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <ColorThemeSelector />
              <ProfileIcon onClick={handleProfileClick} />
            </div>
          </header>
        )}

        <main
          className={`flex-1 flex flex-col min-h-0 overflow-hidden relative ${isExactStacksList ? "pt-16" : ""}`}
        >
          <Outlet />
          <ActionBanner />

          <FullscreenButton />
          <OrientationLock />
        </main>
      </div>
    </Suspense>
  );
};

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const store = useAuthStore.getState();
    if (!store.isInitialized) await store.initialize();

    const { user, loading } = useAuthStore.getState();
    if (loading) return;
    if (!user) {
      throw redirect({
        to: "/login",
        replace: true,
        search: { redirect: location.href || location.pathname },
      });
    }
  },

  component: AuthenticatedLayout,
});
