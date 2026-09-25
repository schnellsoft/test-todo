"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodoStore } from "@/lib/store";
import { TodoItem } from "./todo-item";
import { AddTodoDialog } from "./add-todo-dialog";

export function TodoList() {
  const { todos, categories, subcategories, selectedCategoryId, selectedSubcategoryId } =
    useTodoStore();
  const [addOpen, setAddOpen] = useState(false);
  const [showDone, setShowDone] = useState(true);

  const category = categories.find((c) => c.id === selectedCategoryId);
  const subcategory = subcategories.find((s) => s.id === selectedSubcategoryId);

  const filtered = useMemo(() => {
    return todos
      .filter((t) => (selectedCategoryId ? t.categoryId === selectedCategoryId : true))
      .filter((t) => (selectedSubcategoryId ? t.subcategoryId === selectedSubcategoryId : true))
      .filter((t) => (showDone ? true : !t.done))
      .sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order);
  }, [todos, selectedCategoryId, selectedSubcategoryId, showDone]);

  const title = subcategory?.name ?? category?.name ?? "All todos";
  const remaining = filtered.filter((t) => !t.done).length;

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {remaining} {remaining === 1 ? "task" : "tasks"} remaining
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} disabled={categories.length === 0}>
          <Plus className="h-4 w-4" />
          Add todo
        </Button>
      </div>

      <button
        onClick={() => setShowDone((v) => !v)}
        className="mb-3 self-start text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        {showDone ? "Hide completed" : "Show completed"}
      </button>

      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin pb-6">
        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <p className="text-sm">
              {categories.length === 0
                ? "Create a category first, then add your first todo."
                : "Nothing here yet."}
            </p>
          </div>
        ) : (
          filtered.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>

      <AddTodoDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
