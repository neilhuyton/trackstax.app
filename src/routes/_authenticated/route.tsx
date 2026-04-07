import {
  createFileRoute,
  redirect,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Suspense } from "react";

import { HeaderSheet } from "@/features/header/HeaderSheet";
import { ActionBanner } from "@steel-cut/steel-lib";

const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

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

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      {/* Main container - centered both horizontally and vertically on desktop */}
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[1600px] h-[95vh] max-h-[1080px] flex flex-col rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-[#0a0a0a]">
          <HeaderSheet />
          
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Outlet />
            <ActionBanner />
          </main>
        </div>
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
