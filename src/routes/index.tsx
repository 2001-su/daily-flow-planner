import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTasks, CATEGORY_META, type Category } from "@/lib/tasks-store";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskItem } from "@/components/TaskItem";
import { CalendarView } from "@/components/CalendarView";
import { Sparkles, ListChecks, Star, CalendarDays, User, CheckCircle2, Bell, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daybook — A calmer to-do list" },
      { name: "description", content: "Plan your day, organize tasks by category and priority, and never miss what matters." },
      { property: "og:title", content: "Daybook — A calmer to-do list" },
      { property: "og:description", content: "Plan your day, organize tasks by category and priority, and never miss what matters." },
    ],
  }),
  component: Index,
});

type TopFilter = "all" | "today" | "starred" | Category;
type View = "tasks" | "calendar" | "me";

function Index() {
  const { tasks, hydrated, addTask, toggleDone, toggleStar, removeTask, toggleSubtask } = useTasks();
  const today = new Date().toISOString().slice(0, 10);
  const [view, setView] = useState<View>("tasks");
  const [filter, setFilter] = useState<TopFilter>("all");
  const [selectedDate, setSelectedDate] = useState(today);

  const counts = useMemo(() => {
    const done = tasks.filter((t) => t.done).length;
    const total = tasks.length;
    const todayCount = tasks.filter((t) => t.dueDate === today && !t.done).length;
    const starred = tasks.filter((t) => t.starred && !t.done).length;
    return { done, total, todayCount, starred };
  }, [tasks, today]);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === "today") list = list.filter((t) => t.dueDate === selectedDate);
    else if (filter === "starred") list = list.filter((t) => t.starred);
    else if (filter !== "all") list = list.filter((t) => t.category === filter);

    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      const pri = { high: 0, medium: 1, low: 2 } as const;
      if (pri[a.priority] !== pri[b.priority]) return pri[a.priority] - pri[b.priority];
      if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, selectedDate]);

  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  const progress = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-3xl px-5 pt-8 pb-8">
        {/* Header */}
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Daybook
            </p>
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.05]">
              {greeting}.
            </h1>
          </div>
          {view === "tasks" && <AddTaskDialog onAdd={addTask} defaultDate={selectedDate} />}
        </header>

        {view === "tasks" && (
          <>
            {/* Top filter chips — horizontally scrollable */}
            <div className="-mx-5 px-5 mb-5 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 w-max">
                <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
                <FilterChip active={filter === "today"} onClick={() => { setFilter("today"); setSelectedDate(today); }}>Today</FilterChip>
                <FilterChip active={filter === "starred"} onClick={() => setFilter("starred")}>Starred</FilterChip>
                {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                  <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)} dot={CATEGORY_META[c].color}>
                    {CATEGORY_META[c].label}
                  </FilterChip>
                ))}
              </div>
            </div>

            {!hydrated ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2.5">
                {filtered.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={toggleDone} onStar={toggleStar} onRemove={removeTask} onToggleSub={toggleSubtask} />
                ))}
              </div>
            )}
          </>
        )}

        {view === "calendar" && (
          <div className="space-y-5">
            <CalendarView tasks={tasks} selected={selectedDate} onSelect={(d) => setSelectedDate(d)} />
            <div>
              <p className="font-serif text-2xl italic mb-3 text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.dueDate === selectedDate).length === 0 ? (
                  <EmptyState label="Nothing scheduled for this day." />
                ) : (
                  tasks
                    .filter((t) => t.dueDate === selectedDate)
                    .map((t) => (
                      <TaskItem key={t.id} task={t} onToggle={toggleDone} onStar={toggleStar} onRemove={removeTask} onToggleSub={toggleSubtask} />
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {view === "me" && (
          <MeView counts={counts} progress={progress} tasks={tasks} />
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl grid grid-cols-3">
          <BottomTab active={view === "tasks"} onClick={() => setView("tasks")} icon={<ListChecks className="h-5 w-5" />} label="Tasks" />
          <BottomTab active={view === "calendar"} onClick={() => setView("calendar")} icon={<CalendarDays className="h-5 w-5" />} label="Calendar" />
          <BottomTab active={view === "me"} onClick={() => setView("me")} icon={<User className="h-5 w-5" />} label="Me" />
        </div>
      </nav>
    </div>
  );
}

function FilterChip({ active, onClick, children, dot }: { active: boolean; onClick: () => void; children: React.ReactNode; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-all
        ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border text-foreground"}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}

function BottomTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className={`flex items-center justify-center h-9 w-9 rounded-full transition-colors ${active ? "bg-primary/10" : ""}`}>
        {icon}
      </span>
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );
}

function EmptyState({ label }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
      <p className="font-serif text-3xl italic text-muted-foreground mb-2">A clean slate.</p>
      <p className="text-sm text-muted-foreground">{label ?? "Nothing here yet — add a task to get started."}</p>
    </div>
  );
}

function MeView({ counts, progress, tasks }: { counts: { done: number; total: number; todayCount: number; starred: number }; progress: number; tasks: ReturnType<typeof useTasks>["tasks"] }) {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const [reminders, setReminders] = useState(true);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-3xl border bg-card p-6 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-serif text-2xl">Hello, friend</h2>
        <p className="text-sm text-muted-foreground">{progress}% of your tasks complete</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={counts.done} suffix={`of ${counts.total}`} />
        <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Today" value={counts.todayCount} suffix="open" />
        <StatCard icon={<Star className="h-4 w-4" />} label="Starred" value={counts.starred} suffix="important" />
        <StatCard icon={<ListChecks className="h-4 w-4" />} label="Total" value={tasks.length} suffix="tasks" />
      </div>

      {/* By category */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-serif text-xl mb-3">By category</h3>
        <ul className="space-y-2.5">
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
            const count = tasks.filter((t) => t.category === c && !t.done).length;
            return (
              <li key={c} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_META[c].color }} />
                  {CATEGORY_META[c].label}
                </span>
                <span className="text-muted-foreground tabular-nums">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border bg-card divide-y">
        <SettingRow icon={dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} label="Dark mode" active={dark} onClick={toggleDark} />
        <SettingRow icon={<Bell className="h-4 w-4" />} label="Reminders" active={reminders} onClick={() => setReminders((v) => !v)} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {icon}{label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl">{value}</span>
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors">
      <span className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
