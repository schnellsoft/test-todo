"use client";

import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTodoStore } from "@/lib/store";
import type { Todo } from "@/lib/types";

const PRIORITY_STYLES: Record<Todo["priority"], string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-accent text-accent-foreground",
  high: "bg-destructive/15 text-destructive",
};

export function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo, categories, subcategories } = useTodoStore();
  const category = categories.find((c) => c.id === todo.categoryId);
  const subcategory = subcategories.find((s) => s.id === todo.subcategoryId);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors",
        todo.done && "opacity-60"
      )}
    >
      <Checkbox
        checked={todo.done}
        onCheckedChange={() => toggleTodo(todo.id)}
        className="mt-0.5"
        aria-label={`Mark "${todo.title}" as ${todo.done ? "not done" : "done"}`}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", todo.done && "line-through")}>{todo.title}</p>
        {todo.notes && <p className="mt-0.5 text-xs text-muted-foreground">{todo.notes}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {category && (
            <Badge variant="outline" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
              {category.name}
            </Badge>
          )}
          {subcategory && <Badge variant="secondary">{subcategory.name}</Badge>}
          <Badge className={cn("border-transparent", PRIORITY_STYLES[todo.priority])}>
            {todo.priority}
          </Badge>
        </div>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
