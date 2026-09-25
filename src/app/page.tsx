"use client";

import { AppSidebar, MobileSidebarTrigger } from "@/components/sidebar/app-sidebar";
import { TodoList } from "@/components/todo/todo-list";
import { useTodoStore } from "@/lib/store";

export default function Home() {
  const { loading } = useTodoStore();

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading your todos…
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
          <MobileSidebarTrigger />
          <span className="text-sm font-semibold">Test Todo</span>
        </header>
        <main className="flex-1 overflow-hidden">
          <TodoList />
        </main>
      </div>
    </div>
  );
}
