import type { TaskItem } from './metrics';
import type { TaskView } from '@/components/TaskBoard';

export const toView = (t: TaskItem): TaskView => ({
  key: t.cohort.id + ':' + t.task.id,
  title: t.task.title,
  due: t.due,
  programName: t.program.short,
  programSlug: t.program.slug,
  color: t.program.color,
  cohortNo: t.cohort.no,
  done: t.done
});
