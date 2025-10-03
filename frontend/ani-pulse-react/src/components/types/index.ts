// types/index.ts
// Core data structures that match API expectations exactly

/**
 * Task as expected by the API and stored in application state
 * This is the single source of truth - all components must use this structure
 */
export interface Task {
  id: string;
  name: string;
  duration_days: number;
  predecessors: string[];
  user_risk_rating: number;
  completion_pct?: number; // 0-100 percentage completion//
  owner?: string;
}

/**
 * Project as stored in application state
 * Contains only essential data, no derived/calculated fields
 */
export interface Project {
  name: string;
  tasks: Task[];
  project_start_date?: string;
  description?: string;

  id?: string;
  created?: string;
  lastModified?: string;
  foundationResults?: any;
  analyticsCache?: any;f
}

/**
 * Enhanced task data returned from API after analysis
 * Contains original task data plus calculated results
 */
export interface EnhancedTask extends Task {
  // Calculated from API
  calculated_start: number;
  calculated_duration: number;
  calculated_finish: number;
  is_critical: boolean;
  risk_level: string;
  float_days: number;

  // UI-specific derived fields (calculated in components)
  status?: "completed" | "in-progress" | "pending";
  progress?: number;
  dueDate?: string;
  assignee?: string;
}

/**
 * Project with enhanced task data after API analysis
 */
export interface EnhancedProject {
  name: string;
  tasks: EnhancedTask[];
}

// ============================================================================
// DISPLAY/UI HELPER TYPES
// ============================================================================

/**
 * Project status derived from task risk levels
 */
export type ProjectStatus = "safe" | "caution" | "risk";

/**
 * Status configuration for UI components
 */
export interface StatusConfig {
  color: string;
  label: string;
  icon: any; // React component
  glow: string;
}

/**
 * Configuration mapping for project statuses
 */
export type StatusConfigMap = Record<ProjectStatus, StatusConfig>;

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Request payload for enhanced PDE analysis
 */
export interface PDEAnalysisRequest {
  project_name: string;
  tasks: Task[];
  pde_parameters?: {
    diffusion?: number;
    reaction_multiplier?: number;
    max_delay?: number;
    enable_cascading?: boolean;
    enable_confidence_bands?: boolean;
    confidence_levels?: number[];
  };
}

/**
 * API response structure for PDE analysis
 */
export interface PDEAnalysisResponse {
  success: boolean;
  project_name: string;
  calculation_timestamp: string;
  analysis_type: string;
  foundation_results: {
    project_metrics: {
      total_duration_days: number;
      overall_risk_level: string;
      high_risk_task_count: number;
      critical_path_ids: string[];
      total_tasks: number;
    };
    tasks: Array<{
      id: string;
      name: string;
      scheduled_start_day: number;
      scheduled_finish_day: number;
      is_critical: boolean;
      risk_level: string;
      risk_score: number;
      float_days: number;
    }>;
  };
  pde_analysis: {
    simulation_time: number[];
    classical_completion: number[];
    pde_completion: number[];
    confidence_bands?: any;
    gantt_data: {
      tasks: Array<{
        id: string;
        name: string;
        start: number;
        duration: number;
        finish: number;
        is_critical: boolean;
        risk_level: string;
        float_days: number;
      }>;
      critical_path: string[];
      project_duration: number;
    };
    insights: {
      risk_acceleration_factor: number;
      critical_path_stability: number;
    };
  };
  computation_time_seconds: number;
  parameters_used: {
    diffusion: number;
    reaction_multiplier: number;
    max_delay: number;
    dt: number;
    enable_cascading: boolean;
    enable_confidence_bands: boolean;
    confidence_levels: number[];
  };
  algorithms_used: string[];
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for ProjectCard component
 */
export interface ProjectCardProps {
  project: Project;
  onViewTasks: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onSaveProject: (project: Project) => void;
}

/**
 * Props for RiskAnalytics component
 */
export interface RiskAnalyticsProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate?: (project: Project) => void;
}

/**
 * Props for TaskDetailView component
 */
export interface TaskDetailViewProps {
  project: EnhancedProject | Project;
  onBack: () => void;
}

// ============================================================================
// UTILITY/HELPER TYPES
// ============================================================================

/**
 * Function to derive project status from tasks
 */
export type ProjectStatusCalculator = (tasks: Task[]) => ProjectStatus;

/**
 * Function to calculate project progress percentage
 */
export type ProgressCalculator = (tasks: Task[]) => number;

/**
 * Function to adapt basic task to enhanced task for display
 */
export type TaskAdapter = (task: Task) => EnhancedTask;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if project has enhanced tasks
 */
export function isEnhancedProject(project: Project | EnhancedProject): project is EnhancedProject {
  return project.tasks.length > 0 && 'calculated_start' in project.tasks[0];
}

/**
 * Type guard to check if task is enhanced
 */
export function isEnhancedTask(task: Task | EnhancedTask): task is EnhancedTask {
  return 'calculated_start' in task;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that a task has all required API fields
 */
export function validateTask(task: any): task is Task {
  return (
    typeof task.id === 'string' &&
    typeof task.name === 'string' &&
    typeof task.duration_days === 'number' &&
    Array.isArray(task.predecessors) &&
    typeof task.user_risk_rating === 'number' &&
    task.user_risk_rating >= 0 &&
    task.user_risk_rating <= 5
  );
}

/**
 * Validates that a project has all required fields
 */
export function validateProject(project: any): project is Project {
  return (
    typeof project.name === 'string' &&
    Array.isArray(project.tasks) &&
    project.tasks.every(validateTask)
  );
}

/**
 * Validates that dependencies reference existing tasks
 */
export function validateDependencies(project: Project): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const taskIds = new Set(project.tasks.map(t => t.id));

  for (const task of project.tasks) {
    for (const dep of task.predecessors) {
      if (!taskIds.has(dep)) {
        errors.push(`Task ${task.id} references non-existent dependency: ${dep}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}