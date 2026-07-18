"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, PanelLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

// App frame: collapsible sidebar on desktop, slide-in drawer + top bar on mobile.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop hidden
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebarCollapsed") === "1");
  }, []);

  function setCollapsedPersist(v: boolean) {
    setCollapsed(v);
    localStorage.setItem("sidebarCollapsed", v ? "1" : "0");
  }

  // the button inside the sidebar: collapse on desktop, close the drawer on mobile
  function hideSidebar() {
    if (isDesktop()) setCollapsedPersist(true);
    else setOpen(false);
  }

  return (
    <div className="flex">
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <Sidebar mobileOpen={open} collapsed={collapsed} onNavigate={() => setOpen(false)} onHide={hideSidebar} />

      {/* desktop reopen button — only when collapsed */}
      <button
        onClick={() => setCollapsedPersist(false)}
        aria-label="Show sidebar"
        className={`fixed left-3 top-3 z-40 hidden h-9 w-9 place-items-center rounded-lg border border-white/10 bg-slate-950/80 text-slate-300 backdrop-blur transition hover:text-white ${
          collapsed ? "lg:grid" : "lg:hidden"
        }`}
      >
        <PanelLeft size={18} />
      </button>

      {/* when collapsed, reserve a left gutter on desktop so the floating reopen
          button never overlaps page content */}
      <div className={`flex min-w-0 flex-1 flex-col ${collapsed ? "lg:pl-14" : ""}`}>
        {/* mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-slate-950/70 px-4 py-2.5 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:text-white"
          >
            <Menu size={18} />
          </button>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-extrabold text-onaccent">
            IP
          </div>
          <span className="text-sm font-semibold text-white">Interview Prep</span>
          <button
            onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
            aria-label="Search"
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:text-white"
          >
            <Search size={16} />
          </button>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
