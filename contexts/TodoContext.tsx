import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Priority = "high" | "medium" | "low";

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#FF3B30",
  medium: "#FF9500",
  low: "#34C759",
};

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

interface TodoContextValue {
  todos: Todo[];
  addTodo: (text: string, priority: Priority) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  todayLabel: string;
  completedCount: number;
  totalCount: number;
}

const TodoContext = createContext<TodoContextValue | null>(null);

const STORAGE_KEY = "@daily_todos_v2";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pd !== 0) return pd;
    return a.createdAt - b.createdAt;
  });
}

interface StoredData {
  dateKey: string;
  todos: Todo[];
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todayLabel] = useState<string>(getTodayLabel());

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored: StoredData = JSON.parse(raw);
      const todayKey = getTodayKey();
      if (stored.dateKey === todayKey) {
        setTodos(stored.todos);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setTodos([]);
      }
    } catch {
      setTodos([]);
    }
  };

  const saveTodos = useCallback(async (updatedTodos: Todo[]) => {
    try {
      const data: StoredData = {
        dateKey: getTodayKey(),
        todos: updatedTodos,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  const addTodo = useCallback(
    (text: string, priority: Priority = "medium") => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const newTodo: Todo = {
        id: generateId(),
        text: trimmed,
        completed: false,
        priority,
        createdAt: Date.now(),
      };
      setTodos((prev) => {
        const updated = sortTodos([...prev, newTodo]);
        saveTodos(updated);
        return updated;
      });
    },
    [saveTodos]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setTodos((prev) => {
        const updated = sortTodos(
          prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
        saveTodos(updated);
        return updated;
      });
    },
    [saveTodos]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveTodos(updated);
        return updated;
      });
    },
    [saveTodos]
  );

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
        todayLabel,
        completedCount,
        totalCount,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used within TodoProvider");
  return ctx;
}
