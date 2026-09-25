"use client";

import { useState } from "react";
import { ChevronRight, Folder, ListTodo, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSubcategoryDialog } from "./add-subcategory-dialog";

export function CategoryTree({ onNavigate }: { onNavigate?: () => void }) {
  const {
    categories,
    subcategories,
    todos,
    selectedCategoryId,
    selectedSubcategoryId,
    selectCategory,
    selectSubcategory,
    deleteCategory,
    deleteSubcategory,
  } = useTodoStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subDialogCategoryId, setSubDialogCategoryId] = useState<string | null>(null);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const countFor = (categoryId: string, subcategoryId?: string) =>
    todos.filter(
      (t) =>
        !t.done &&
        t.categoryId === categoryId &&
        (subcategoryId === undefined || t.subcategoryId === subcategoryId)
    ).length;

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {/* Level 1: root view */}
      <button
        onClick={() => {
          selectCategory(null);
          onNavigate?.();
        }}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          !selectedCategoryId && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        <ListTodo className="h-4 w-4" />
        All todos
        <span className="ml-auto text-xs text-muted-foreground">
          {todos.filter((t) => !t.done).length}
        </span>
      </button>

      <div className="mt-3 flex items-center justify-between px-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Categories
        </span>
      </div>

      {/* Level 2: categories */}
      {categories.map((category) => {
        const subs = subcategories.filter((s) => s.categoryId === category.id);
        const isExpanded = expanded[category.id] ?? true;
        const isSelected = selectedCategoryId === category.id && !selectedSubcategoryId;

        return (
          <div key={category.id} className="mt-0.5">
            <div
              className={cn(
                "group flex items-center gap-1 rounded-md pr-1 text-sm hover:bg-sidebar-accent",
                isSelected && "bg-sidebar-accent"
              )}
            >
              <button
                onClick={() => subs.length > 0 && toggleExpanded(category.id)}
                className="p-1.5 text-muted-foreground"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {subs.length > 0 ? (
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")}
                  />
                ) : (
                  <span className="block h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => {
                  selectCategory(category.id);
                  onNavigate?.();
                }}
                className="flex flex-1 items-center gap-2 py-1.5 text-left"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="truncate">{category.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {countFor(category.id)}
                </span>
              </button>
              <CategoryMenu
                onAddSubcategory={() => setSubDialogCategoryId(category.id)}
                onDelete={() => deleteCategory(category.id)}
              />
            </div>

            {/* Level 3: subcategories */}
            {isExpanded && subs.length > 0 && (
              <div className="ml-6 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
                {subs.map((sub) => {
                  const subSelected = selectedSubcategoryId === sub.id;
                  return (
                    <div
                      key={sub.id}
                      className={cn(
                        "group flex items-center rounded-md pr-1 hover:bg-sidebar-accent",
                        subSelected && "bg-sidebar-accent"
                      )}
                    >
                      <button
                        onClick={() => {
                          selectCategory(category.id);
                          selectSubcategory(sub.id);
                          onNavigate?.();
                        }}
                        className={cn(
                          "flex flex-1 items-center gap-2 py-1.5 text-left text-sm",
                          subSelected ? "text-sidebar-accent-foreground font-medium" : "text-muted-foreground"
                        )}
                      >
                        <Folder className="h-3.5 w-3.5" />
                        <span className="truncate">{sub.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {countFor(category.id, sub.id)}
                        </span>
                      </button>
                      <button
                        onClick={() => deleteSubcategory(sub.id)}
                        aria-label={`Delete ${sub.name}`}
                        className="hidden p-1 text-muted-foreground hover:text-destructive group-hover:block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {categories.length === 0 && (
        <p className="px-2 py-3 text-xs text-muted-foreground">
          No categories yet. Add one to get started.
        </p>
      )}

      <AddSubcategoryDialog
        open={subDialogCategoryId !== null}
        onOpenChange={(open) => !open && setSubDialogCategoryId(null)}
        categoryId={subDialogCategoryId}
      />
    </nav>
  );
}

function CategoryMenu({
  onAddSubcategory,
  onDelete,
}: {
  onAddSubcategory: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-6 w-6 group-hover:flex"
          aria-label="Category options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAddSubcategory}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add subcategory
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
