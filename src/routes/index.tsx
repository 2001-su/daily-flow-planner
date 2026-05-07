import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTasks, CATEGORY_META, type Category } from "@/lib/tasks-store";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskItem } from "@/components/TaskItem";
import { CalendarView } from "@/components/CalendarView";
import { Sparkles, ListChecks, Star, CalendarDays } from "lucide-react";

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

type Filter = "today" | "all" | "starred" | "upcoming" | Category;

function Index() {
  const { tasks, hydrated, addTask, toggleDone, toggleStar, removeTask, toggleSubtask } = useTasks();
  const today = new Date().toISOString().slice(0, 10);
  const [filter, setFilter] = useState<Filter>("today");
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
    else if (filter === "upcoming") list = list.filter((t) => t.dueDate && t.dueDate > today);
    else if (filter !== "all") list = list.filter((t) => t.category === filter);

    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      const pri = { high: 0, medium: 1, low: 2 } as const;
      if (pri[a.priority] !== pri[b.priority]) return pri[a.priority] - pri[b.priority];
      if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, selectedDate, today]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const niceDate = new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const progress = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-10 lg:py-14">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Daybook
            </p>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">
              {greeting}.<br />
              <span className="italic text-muted-foreground">Here's your day.</span>
            </h1>
          </div>
          <AddTaskDialog onAdd={addTask} defaultDate={selectedDate} />
        </header>

        {/* Stats strip */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Today" value={counts.todayCount} suffix="open" />
          <StatCard icon={<Star className="h-4 w-4" />} label="Starred" value={counts.starred} suffix="important" />
          <StatCard icon={<ListChecks className="h-4 w-4" />} label="Completed" value={counts.done} suffix={`of ${counts.total}`} />
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="uppercase tracking-wider">Progress</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">You're getting better.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Main column */}
          <div>
            {/* Filter tabs */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <FilterChip active={filter === "today"} onClick={() => { setFilter("today"); setSelectedDate(today); }}>Today</FilterChip>
              <FilterChip active={filter === "upcoming"} onClick={() => setFilter("upcoming")}>Upcoming</FilterChip>
              <FilterChip active={filter === "starred"} onClick={() => setFilter("starred")}>Starred</FilterChip>
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
              <span className="mx-1 h-4 w-px bg-border" />
              {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)} dot={CATEGORY_META[c].color}>
                  {CATEGORY_META[c].label}
                </FilterChip>
              ))}
            </div>

            {filter === "today" && (
              <p className="font-serif text-2xl italic mb-4 text-muted-foreground">{niceDate}</p>
            )}

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
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <CalendarView tasks={tasks} selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setFilter("today"); }} />
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
          </aside>
        </div>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Saved locally on your device. Cloud sync coming soon.
        </footer>
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
        <span className="font-serif text-4xl">{value}</span>
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children, dot }: { active: boolean; onClick: () => void; children: React.ReactNode; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all
        ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border text-foreground"}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
      <p className="font-serif text-3xl italic text-muted-foreground mb-2">A clean slate.</p>
      <p className="text-sm text-muted-foreground">Nothing here yet — add a task to get started.</p>
    </div>
  );
}
