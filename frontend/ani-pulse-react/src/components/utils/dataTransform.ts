// utils/dataTransform.ts
// Transforms API gantt data by merging with original input data
// This preserves user context (dependencies, risk ratings) while adding calculated results

interface OriginalTask {
  id: string;
  name: string;
  duration_days: number;
  predecessors: string[];
  user_risk_rating: number;
}

interface GanttTask {
  id: string;
  name: string;
  start: number;
  duration: number;
  finish: number;
  is_critical: boolean;
  risk_level: string;
  float_days?: number;
}

interface EnhancedTask {
  // Core identifiers
  id: string;
  name: string;

  // Preserved from original input (CRITICAL for SubtaskDetailView)
  predecessors: string[];
  user_risk_rating: number;
  original_duration: number;

  // Calculated from API
  calculated_start: number;
  calculated_duration: number;
  calculated_finish: number;
  is_critical: boolean;
  risk_level: string;
  float_days: number;

  // UI-specific fields for SubtaskDetailView
  status: "completed" | "in-progress" | "pending";
  progress: number;
  dueDate: string;
  assignee: string;
}

/**
 * Merges API gantt results with original input data
 * This solves the "lost dependencies" problem by preserving user context
 */
export function mergeApiWithInput(
  ganttData: { tasks: GanttTask[] } | null,
  originalTasks: OriginalTask[]
): EnhancedTask[] {
  if (!ganttData || !ganttData.tasks || !originalTasks) {
    console.warn("Missing data for merge operation:", { ganttData: !!ganttData, originalTasks: originalTasks?.length });
    return [];
  }

  return ganttData.tasks.map(apiTask => {
    // Find matching original task
    const originalTask = originalTasks.find(orig => orig.id === apiTask.id);

    if (!originalTask) {
      console.warn(`No original task found for API task ID: ${apiTask.id}`);
    }

    // Map API risk level to UI status
    const getStatus = (apiTask: GanttTask): EnhancedTask['status'] => {
      if (apiTask.is_critical) return "in-progress";
      if (apiTask.risk_level === "green") return "completed";
      return "pending";
    };

    // Calculate progress based on timeline position
    const calculateProgress = (apiTask: GanttTask): number => {
      if (!apiTask.finish || apiTask.finish === 0) return 0;

      // Assume we're partway through the task timeline for demo purposes
      const progressRatio = (apiTask.start + apiTask.duration * 0.6) / apiTask.finish;
      return Math.min(100, Math.max(0, Math.round(progressRatio * 100)));
    };

    // Generate due date from finish time
    const generateDueDate = (finishDay: number): string => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + finishDay);
      return dueDate.toISOString().split('T')[0];
    };

    return {
      // Core identifiers
      id: apiTask.id,
      name: apiTask.name,

      // CRITICAL: Preserve original user input
      predecessors: originalTask?.predecessors || [],
      user_risk_rating: originalTask?.user_risk_rating || 0,
      original_duration: originalTask?.duration_days || 0,

      // Calculated from API
      calculated_start: apiTask.start,
      calculated_duration: apiTask.duration,
      calculated_finish: apiTask.finish,
      is_critical: apiTask.is_critical,
      risk_level: apiTask.risk_level,
      float_days: apiTask.float_days || 0,

      // UI-specific fields
      status: getStatus(apiTask),
      progress: calculateProgress(apiTask),
      dueDate: generateDueDate(apiTask.finish),
      assignee: `Developer ${apiTask.id}` // TODO: Replace with real assignee data
    };
  });
}

/**
 * Validates that merge operation preserved all critical data
 */
export function validateMergedData(
  enhanced: EnhancedTask[],
  original: OriginalTask[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check count matches
  if (enhanced.length !== original.length) {
    errors.push(`Task count mismatch: ${enhanced.length} enhanced vs ${original.length} original`);
  }

  // Check all dependencies preserved
  for (const task of enhanced) {
    const originalTask = original.find(o => o.id === task.id);
    if (!originalTask) continue;

    if (JSON.stringify(task.predecessors.sort()) !== JSON.stringify(originalTask.predecessors.sort())) {
      errors.push(`Dependencies mismatch for task ${task.id}`);
    }

    if (task.user_risk_rating !== originalTask.user_risk_rating) {
      errors.push(`Risk rating mismatch for task ${task.id}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Debug helper to log transformation results
 */
export function logTransformation(
  original: OriginalTask[],
  enhanced: EnhancedTask[]
): void {
  console.group("🔄 Data Transformation Results");
  console.log("Original tasks:", original.length);
  console.log("Enhanced tasks:", enhanced.length);

  enhanced.forEach(task => {
    console.log(`${task.name}:`);
    console.log(`  Dependencies: [${task.predecessors.join(', ')}]`);
    console.log(`  Duration: ${task.original_duration}d → ${task.calculated_duration}d`);
    console.log(`  Risk: ${task.user_risk_rating}/5, Critical: ${task.is_critical}`);
  });

  const validation = validateMergedData(enhanced, original);
  if (validation.isValid) {
    console.log("✅ Validation passed");
  } else {
    console.warn("❌ Validation errors:", validation.errors);
  }

  console.groupEnd();
}