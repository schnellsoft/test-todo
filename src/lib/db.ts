"use client";

import type { Category, Subcategory, Todo } from "./types";

const DB_NAME = "test-todo-db";
const DB_VERSION = 1;

export const STORES = {
  categories: "categories",
  subcategories: "subcategories",
  todos: "todos",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.categories)) {
        const store = db.createObjectStore(STORES.categories, { keyPath: "id" });
        store.createIndex("order", "order");
      }
      if (!db.objectStoreNames.contains(STORES.subcategories)) {
        const store = db.createObjectStore(STORES.subcategories, { keyPath: "id" });
        store.createIndex("categoryId", "categoryId");
        store.createIndex("order", "order");
      }
      if (!db.objectStoreNames.contains(STORES.todos)) {
        const store = db.createObjectStore(STORES.todos, { keyPath: "id" });
        store.createIndex("categoryId", "categoryId");
        store.createIndex("subcategoryId", "subcategoryId");
        store.createIndex("order", "order");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);

    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);

    if (req) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      tx.oncomplete = () => resolve(undefined as unknown as T);
    }
  });
}

function getAll<T>(storeName: string): Promise<T[]> {
  return withStore<T[]>(storeName, "readonly", (store) => store.getAll());
}

function put<T>(storeName: string, value: T): Promise<T> {
  return withStore<IDBValidKey>(storeName, "readwrite", (store) => store.put(value)).then(
    () => value
  );
}

function remove(storeName: string, id: string): Promise<void> {
  return withStore<undefined>(storeName, "readwrite", (store) => store.delete(id)).then(
    () => undefined
  );
}

export const db = {
  categories: {
    getAll: () => getAll<Category>(STORES.categories),
    put: (value: Category) => put(STORES.categories, value),
    delete: (id: string) => remove(STORES.categories, id),
  },
  subcategories: {
    getAll: () => getAll<Subcategory>(STORES.subcategories),
    put: (value: Subcategory) => put(STORES.subcategories, value),
    delete: (id: string) => remove(STORES.subcategories, id),
  },
  todos: {
    getAll: () => getAll<Todo>(STORES.todos),
    put: (value: Todo) => put(STORES.todos, value),
    delete: (id: string) => remove(STORES.todos, id),
  },
};
