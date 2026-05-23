import { Star, Bell, Trash2, ChevronDown, Repeat as RepeatIcon } from "lucide-react";
import { useState } from "react";
import { CATEGORY_META, type Task } from "@/lib/tasks-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onStar: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleSub: (taskId: string, subId: string) => void;
}

export function TaskItem({ task, onToggle, onStar, onRemove, onToggleSub }: Props) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_META[task.category];
  const hasMeta = task.subtasks.length > 0 || task.notes;

  return (
    <div className={`group rounded-2xl border bg-card transition-all hover:shadow-sm ${task.done ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3 p-4">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: cat.color }} aria-hidden />
        <Checkbox checked={task.done} onCheckedChange={() => onToggle(task.id)} className="mt-0.5 h-5 w-5 rounded-full data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-base font-medium leading-snug ${task.done ? "line-through" : ""}`}>{task.title}</p>
            {task.priority === "high" && !task.done && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">High</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{cat.label}</span>
            {task.dueTime && <span>· {task.dueTime}</span>}
            {task.reminder && (<span className="inline-flex items-center gap-1"><Bell className="h-3 w-3" /> Reminder</span>)}
            {task.subtasks.length > 0 && (
              <span>· {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtasks</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onStar(task.id)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-accent transition-colors">
            <Star className={`h-4 w-4 ${task.starred ? "fill-accent text-accent" : ""}`} />
          </button>
          {hasMeta && (
            <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onRemove(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {open && hasMeta && (
        <div className="border-t px-4 py-3 pl-12 space-y-2">
          {task.notes && <p className="text-sm text-muted-foreground italic">{task.notes}</p>}
          {task.subtasks.map((s) => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={s.done} onCheckedChange={() => onToggleSub(task.id, s.id)} className="h-4 w-4" />
              <span className={`text-sm ${s.done ? "line-through text-muted-foreground" : ""}`}>{s.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
