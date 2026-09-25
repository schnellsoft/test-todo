export type Priority = "low" | "medium" | "high";

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface Todo {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  title: string;
  notes: string;
  done: boolean;
  priority: Priority;
  dueDate: string | null; // ISO date string
  order: number;
  createdAt: number;
  updatedAt: number;
}
