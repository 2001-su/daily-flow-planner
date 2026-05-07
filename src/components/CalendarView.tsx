import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "@/lib/tasks-store";
import { CATEGORY_META } from "@/lib/tasks-store";

interface Props {
  tasks: Task[];
  selected: string;
  onSelect: (date: string) => void;
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function CalendarView({ tasks, selected, onSelect }: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(selected || new Date());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const { days, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));
    while (cells.length % 7 !== 0) cells.push(null);
    return {
      days: cells,
      monthLabel: cursor.toLocaleString(undefined, { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const m = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const arr = m.get(t.dueDate) ?? [];
      arr.push(t);
      m.set(t.dueDate, arr);
    });
    return m;
  }, [tasks]);

  const today = fmt(new Date());

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-2xl">{monthLabel}</h3>
        <div className="flex gap-1">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="rounded-full p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (<div key={d} className="text-center py-1">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = fmt(d);
          const dayTasks = tasksByDate.get(key) ?? [];
          const isSelected = key === selected;
          const isToday = key === today;
          return (
            <button
              key={i}
              onClick={() => onSelect(key)}
              className={`aspect-square rounded-lg p-1.5 text-left transition-all relative
                ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                ${isToday && !isSelected ? "ring-1 ring-accent" : ""}`}
            >
              <div className={`text-xs font-medium ${isToday && !isSelected ? "text-accent" : ""}`}>{d.getDate()}</div>
              {dayTasks.length > 0 && (
                <div className="absolute bottom-1 left-1.5 right-1.5 flex gap-0.5">
                  {dayTasks.slice(0, 4).map((t) => (
                    <span key={t.id} className="h-1 flex-1 rounded-full" style={{ background: isSelected ? "currentColor" : CATEGORY_META[t.category].color, opacity: isSelected ? 0.7 : 1 }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
