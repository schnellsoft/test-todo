"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { db } from "./db";
import type { Category, Priority, Subcategory, Todo } from "./types";
import { uid } from "./utils";

interface TodoStoreValue {
  loading: boolean;
  categories: Category[];
  subcategories: Subcategory[];
  todos: Todo[];

  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectCategory: (id: string | null) => void;
  selectSubcategory: (id: string | null) => void;

  addCategory: (name: string, color: string) => Promise<void>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addSubcategory: (categoryId: string, name: string) => Promise<void>;
  renameSubcategory: (id: string, name: string) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  addTodo: (input: {
    title: string;
    notes?: string;
    priority?: Priority;
    dueDate?: string | null;
    categoryId: string;
    subcategoryId: string | null;
  }) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, patch: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

const TodoStoreContext = createContext<TodoStoreValue | null>(null);

const DEFAULT_COLORS = [
  "#7fb59a", // sage
  "#e0a458", // amber
  "#7a9dce", // slate blue
  "#c97b9e", // mauve
  "#c98a5a", // clay
];

export function TodoStoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, subs, allTodos] = await Promise.all([
          db.categories.getAll(),
          db.subcategories.getAll(),
          db.todos.getAll(),
        ]);
        if (!mounted) return;

        if (cats.length === 0) {
          const seeded = await seedDefaults();
          setCategories(seeded.categories);
          setSubcategories(seeded.subcategories);
          setTodos(seeded.todos);
        } else {
          setCategories(cats.sort((a, b) => a.order - b.order));
          setSubcategories(subs.sort((a, b) => a.order - b.order));
          setTodos(allTodos.sort((a, b) => a.order - b.order));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectCategory = useCallback((id: string | null) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  }, []);

  const selectSubcategory = useCallback((id: string | null) => {
    setSelectedSubcategoryId(id);
  }, []);

  const addCategory = useCallback(
    async (name: string, color: string) => {
      const category: Category = {
        id: uid(),
        name,
        color,
        order: categories.length,
        createdAt: Date.now(),
      };
      await db.categories.put(category);
      setCategories((prev) => [...prev, category]);
    },
    [categories.length]
  );

  const renameCategory = useCallback(async (id: string, name: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, name } : c));
      const updated = next.find((c) => c.id === id);
      if (updated) db.categories.put(updated);
      return next;
    });
  }, []);

  const deleteCategory = useCallback(
    async (id: string) => {
      const subIds = subcategories.filter((s) => s.categoryId === id).map((s) => s.id);
      await Promise.all([
        db.categories.delete(id),
        ...subIds.map((sid) => db.subcategories.delete(sid)),
        ...todos.filter((t) => t.categoryId === id).map((t) => db.todos.delete(t.id)),
      ]);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSubcategories((prev) => prev.filter((s) => s.categoryId !== id));
      setTodos((prev) => prev.filter((t) => t.categoryId !== id));
      setSelectedCategoryId((prev) => (prev === id ? null : prev));
      setSelectedSubcategoryId((prev) => (subIds.includes(prev ?? "") ? null : prev));
    },
    [subcategories, todos]
  );

  const addSubcategory = useCallback(
    async (categoryId: string, name: string) => {
      const order = subcategories.filter((s) => s.categoryId === categoryId).length;
      const subcategory: Subcategory = {
        id: uid(),
        categoryId,
        name,
        order,
        createdAt: Date.now(),
      };
      await db.subcategories.put(subcategory);
      setSubcategories((prev) => [...prev, subcategory]);
    },
    [subcategories]
  );

  const renameSubcategory = useCallback(async (id: string, name: string) => {
    setSubcategories((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, name } : s));
      const updated = next.find((s) => s.id === id);
      if (updated) db.subcategories.put(updated);
      return next;
    });
  }, []);

  const deleteSubcategory = useCallback(
    async (id: string) => {
      await Promise.all([
        db.subcategories.delete(id),
        ...todos.filter((t) => t.subcategoryId === id).map((t) => db.todos.delete(t.id)),
      ]);
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
      setTodos((prev) => prev.filter((t) => t.subcategoryId !== id));
      setSelectedSubcategoryId((prev) => (prev === id ? null : prev));
    },
    [todos]
  );

  const addTodo = useCallback<TodoStoreValue["addTodo"]>(
    async (input) => {
      const order = todos.length;
      const todo: Todo = {
        id: uid(),
        title: input.title,
        notes: input.notes ?? "",
        done: false,
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ?? null,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        order,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.todos.put(todo);
      setTodos((prev) => [...prev, todo]);
    },
    [todos.length]
  );

  const toggleTodo = useCallback(async (id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, done: !t.done, updatedAt: Date.now() } : t
      );
      const updated = next.find((t) => t.id === id);
      if (updated) db.todos.put(updated);
      return next;
    });
  }, []);

  const updateTodo = useCallback(async (id: string, patch: Partial<Todo>) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
      );
      const updated = next.find((t) => t.id === id);
      if (updated) db.todos.put(updated);
      return next;
    });
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    await db.todos.delete(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<TodoStoreValue>(
    () => ({
      loading,
      categories,
      subcategories,
      todos,
      selectedCategoryId,
      selectedSubcategoryId,
      selectCategory,
      selectSubcategory,
      addCategory,
      renameCategory,
      deleteCategory,
      addSubcategory,
      renameSubcategory,
      deleteSubcategory,
      addTodo,
      toggleTodo,
      updateTodo,
      deleteTodo,
    }),
    [
      loading,
      categories,
      subcategories,
      todos,
      selectedCategoryId,
      selectedSubcategoryId,
      selectCategory,
      selectSubcategory,
      addCategory,
      renameCategory,
      deleteCategory,
      addSubcategory,
      renameSubcategory,
      deleteSubcategory,
      addTodo,
      toggleTodo,
      updateTodo,
      deleteTodo,
    ]
  );

  return <TodoStoreContext.Provider value={value}>{children}</TodoStoreContext.Provider>;
}

export function useTodoStore() {
  const ctx = useContext(TodoStoreContext);
  if (!ctx) throw new Error("useTodoStore must be used within TodoStoreProvider");
  return ctx;
}

async function seedDefaults() {
  const now = Date.now();
  const work: Category = { id: uid(), name: "Work", color: DEFAULT_COLORS[2], order: 0, createdAt: now };
  const personal: Category = { id: uid(), name: "Personal", color: DEFAULT_COLORS[0], order: 1, createdAt: now };

  const workProjects: Subcategory = { id: uid(), categoryId: work.id, name: "Projects", order: 0, createdAt: now };
  const workMeetings: Subcategory = { id: uid(), categoryId: work.id, name: "Meetings", order: 1, createdAt: now };
  const personalHome: Subcategory = { id: uid(), categoryId: personal.id, name: "Home", order: 0, createdAt: now };

  const categories = [work, personal];
  const subcategories = [workProjects, workMeetings, personalHome];

  const todos: Todo[] = [
    {
      id: uid(),
      categoryId: work.id,
      subcategoryId: workProjects.id,
      title: "Set up the project repository",
      notes: "Initialize git, add README",
      done: false,
      priority: "high",
      dueDate: null,
      order: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      categoryId: work.id,
      subcategoryId: workMeetings.id,
      title: "Prepare notes for standup",
      notes: "",
      done: false,
      priority: "medium",
      dueDate: null,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      categoryId: personal.id,
      subcategoryId: personalHome.id,
      title: "Buy groceries",
      notes: "Milk, eggs, bread",
      done: false,
      priority: "low",
      dueDate: null,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await Promise.all([
    ...categories.map((c) => db.categories.put(c)),
    ...subcategories.map((s) => db.subcategories.put(s)),
    ...todos.map((t) => db.todos.put(t)),
  ]);

  return { categories, subcategories, todos };
}
