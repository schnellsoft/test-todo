"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTodoStore } from "@/lib/store";

export function AddSubcategoryDialog({
  open,
  onOpenChange,
  categoryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
}) {
  const { addSubcategory } = useTodoStore();
  const [name, setName] = useState("");

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;
    await addSubcategory(categoryId, trimmed);
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New subcategory</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="subcategory-name">Name</Label>
          <Input
            id="subcategory-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Projects"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            Add subcategory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
