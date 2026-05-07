import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_META, type Category, type Priority, type Task } from "@/lib/tasks-store";
import { Plus, Star } from "lucide-react";

interface Props {
  onAdd: (t: Omit<Task, "id" | "createdAt" | "subtasks" | "done">) => void;
  defaultDate?: string;
  trigger?: React.ReactNode;
}

export function AddTaskDialog({ onAdd, defaultDate, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(defaultDate ?? "");
  const [dueTime, setDueTime] = useState("");
  const [reminder, setReminder] = useState(false);
  const [starred, setStarred] = useState(false);

  function reset() {
    setTitle(""); setNotes(""); setCategory("personal"); setPriority("medium");
    setDueDate(defaultDate ?? ""); setDueTime(""); setReminder(false); setStarred(false);
  }

  function submit() {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      notes: notes.trim() || undefined,
      category, priority, starred, reminder,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg" className="gap-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
            <Plus className="h-4 w-4" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">New task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input autoFocus placeholder="What needs to happen?" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Optional details…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_META).map(([k, m]) => (
                    <SelectItem key={k} value={k}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div>
              <Label className="text-sm">Reminder alarm</Label>
              <p className="text-xs text-muted-foreground">Notify me when it's time</p>
            </div>
            <Switch checked={reminder} onCheckedChange={setReminder} />
          </div>
          <button type="button" onClick={() => setStarred(!starred)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Star className={`h-4 w-4 ${starred ? "fill-accent text-accent" : ""}`} />
            {starred ? "Starred" : "Mark as important"}
          </button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-primary text-primary-foreground">Add task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
