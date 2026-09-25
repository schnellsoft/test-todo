"use client";

import { useState } from "react";
import { ListChecks, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CategoryTree } from "./category-tree";
import { AddCategoryDialog } from "./add-category-dialog";

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <ListChecks className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">Test Todo</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
        <CategoryTree onNavigate={onNavigate} />
      </div>

      <div className="border-t border-sidebar-border p-3">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setAddCategoryOpen(true)}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          New category
        </Button>
      </div>

      <AddCategoryDialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen} />
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebarTrigger() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SidebarBody onNavigate={() => setMobileOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
