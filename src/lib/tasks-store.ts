import { useEffect, useState, useCallback } from "react";

export type Priority = "low" | "medium" | "high";
export type Category = "personal" | "work" | "study" | "health" | "wishlist";
export type Repeat = "none" | "daily" | "weekly" | "monthly";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: Category;
  priority: Priority;
  starred: boolean;
  done: boolean;
  dueDate?: string; // ISO yyyy-mm-dd
  dueTime?: string; // HH:mm
  reminder: boolean;
  repeat?: Repeat;
  subtasks: SubTask[];
  createdAt: number;
}

const KEY = "todo.tasks.v1";

function load(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function seed(): Task[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: crypto.randomUUID(),
      title: "Morning run — 5km",
      category: "health",
      priority: "medium",
      starred: false,
      done: false,
      dueDate: today,
      dueTime: "07:00",
      reminder: true,
      repeat: "daily",
      subtasks: [],
      createdAt: Date.now() - 3000,
    },
    {
      id: crypto.randomUUID(),
      title: "Finish quarterly report",
      notes: "Include revenue breakdown and forecast.",
      category: "work",
      priority: "high",
      starred: true,
      done: false,
      dueDate: today,
      dueTime: "16:30",
      reminder: true,
      subtasks: [
        { id: crypto.randomUUID(), title: "Pull metrics", done: true },
        { id: crypto.randomUUID(), title: "Draft summary", done: false },
        { id: crypto.randomUUID(), title: "Review with team", done: false },
      ],
      createdAt: Date.now() - 2000,
    },
    {
      id: crypto.randomUUID(),
      title: "Mom's birthday — call & send flowers",
      category: "personal",
      priority: "high",
      starred: true,
      done: false,
      reminder: true,
      subtasks: [],
      createdAt: Date.now() - 1000,
    },
    {
      id: crypto.randomUUID(),
      title: "Read one chapter of 'Atomic Habits'",
      category: "study",
      priority: "low",
      starred: false,
      done: true,
      reminder: false,
      subtasks: [],
      createdAt: Date.now() - 500,
    },
  ];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const addTask = useCallback((t: Omit<Task, "id" | "createdAt" | "subtasks" | "done"> & { subtasks?: SubTask[] }) => {
    setTasks((prev) => [
      {
        ...t,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        done: false,
        subtasks: t.subtasks ?? [],
      },
      ...prev,
    ]);
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) }
          : t,
      ),
    );
  }, []);

  return { tasks, hydrated, addTask, updateTask, toggleDone, toggleStar, removeTask, toggleSubtask };
}

export const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  personal: { label: "Personal", color: "var(--color-coral)" },
  work: { label: "Work", color: "var(--color-ink)" },
  study: { label: "Study", color: "var(--color-sky)" },
  health: { label: "Health", color: "var(--color-sage)" },
  wishlist: { label: "Wishlist", color: "var(--color-ochre)" },
};

export const PRIORITY_META: Record<Priority, { label: string; weight: number }> = {
  low: { label: "Low", weight: 0 },
  medium: { label: "Medium", weight: 1 },
  high: { label: "High", weight: 2 },
};
