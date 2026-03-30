import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ThemeToggle } from "@steel-cut/steel-lib";
import { ColorThemeSelector } from "@steel-cut/steel-lib";
import { ProfileIcon } from "@steel-cut/steel-lib";
import { APP_CONFIG } from "@/appConfig";
import { useNavigate } from "@tanstack/react-router";

export function HeaderSheet() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate({ to: "/profile" });
    setOpen(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ease-out pointer-events-none ${
        open ? "translate-y-0" : "-translate-y-20"
      }`}
    >
      {/* Handle - this should now be visible when closed */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
        onClick={() => setOpen(!open)}
      >
        <div className="h-7 bg-red-500 border-x border-b border-border shadow-sm rounded-b-xl flex items-center justify-center px-4 cursor-pointer">
          <div className="flex items-center gap-1">
            {open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest">
              MENU
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`pt-7 overflow-hidden transition-all duration-300 pointer-events-auto ${open ? "max-h-[240px]" : "max-h-0"}`}
      >
        <div className="bg-green-500 border border-b-0 border-border">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold tracking-tight flex items-center gap-2.5">
                {APP_CONFIG.appName}
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <ThemeToggle />
                <ColorThemeSelector />
                <ProfileIcon onClick={handleProfileClick} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
