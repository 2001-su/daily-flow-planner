## Recurring tasks

Add daily/weekly/monthly repeat support to tasks.

### Data model (`src/lib/tasks-store.ts`)
- Add `repeat?: "none" | "daily" | "weekly" | "monthly"` to `Task`.
- In `toggleDone`: if marking a recurring task as done and it has a `dueDate`, auto-create the next occurrence (same fields, new id, `done: false`, `dueDate` advanced by interval).
- Seed one task with `repeat: "daily"` so it's visible.

### Add Task dialog (`src/components/AddTaskDialog.tsx`)
- New "Repeat" Select (None / Daily / Weekly / Monthly), placed next to Priority.
- Include `repeat` in the `onAdd` payload.

### Task item (`src/components/TaskItem.tsx`)
- Show a small ↻ Repeat badge in the meta row when `task.repeat && task.repeat !== "none"` (label: Daily/Weekly/Monthly).

No backend, no other features touched.