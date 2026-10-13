import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultFilters, mockRepository } from "../services/analytics";
import { actionTasks } from "../data/mockData";
import type { Filters, Task } from "../types";
function useStateModel() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [storageError, setStorageError] = useState("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("ibk-tasks-v1");
      if (!saved) return actionTasks;
      const parsed: unknown = JSON.parse(saved);
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (t) =>
            t &&
            typeof t.id === "string" &&
            typeof t.title === "string" &&
            ["대기", "진행중", "완료", "지연"].includes(t.status),
        )
      )
        return actionTasks;
      return parsed as Task[];
    } catch {
      return actionTasks;
    }
  });
  const data = useMemo(() => mockRepository.load(filters), [filters]);
  function saveTasks(next: Task[]) {
    try {
      localStorage.setItem("ibk-tasks-v1", JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "브라우저 저장이 차단되어 새로고침 시 변경사항이 유지되지 않습니다.",
      );
    }
    setTasks(next);
  }
  return { filters, setFilters, data, tasks, saveTasks, storageError };
}
const Context = createContext<ReturnType<typeof useStateModel> | null>(null);
export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useStateModel();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDashboard() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("DashboardProvider missing");
  return ctx;
}
