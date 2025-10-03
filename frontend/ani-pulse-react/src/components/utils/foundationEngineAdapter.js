// foundationEngineAdapter.js
// Single source of truth for all Foundation Engine → Frontend transformations

import { addBusinessDays, format, parseISO } from 'date-fns';

// ===== CONFIGURATION =====

const RISK_MAPPING = {
  green: {
    status: "Blessed Path",
    color: "#4CAF50",
    glow: "#4CAF5040",
    mysticalLabel: "✨ Blessed Path"
  },
  yellow: {
    status: "Perilous Winds",
    color: "#F59E0B",
    glow: "#F59E0B40",
    mysticalLabel: "⚠️ Perilous Winds"
  },
  red: {
    status: "Cursed Fate",
    color: "#F44336",
    glow: "#F4433640",
    mysticalLabel: "🔴 Cursed Fate"
  }
};

const DEFAULT_RISK = {
  status: "Unknown Path",
  color: "#8B6914",
  glow: "#8B691440",
  mysticalLabel: "🔮 Unknown Path"
};

// ===== CORE TRANSFORMATION FUNCTIONS =====

/**
 * Convert Foundation Engine business days to calendar date
 * @param {string} startDate - ISO date string "2025-09-14"
 * @param {number} businessDays - Business days from Foundation Engine
 * @returns {string} - Formatted date "January 28, 2025"
 */
export function businessDaysToCalendarDate(startDate, businessDays) {
  try {
    const start = parseISO(startDate);
    const completionDate = addBusinessDays(start, Math.ceil(businessDays));
    return format(completionDate, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Date conversion error:', error);
    return `Day ${Math.ceil(businessDays)}`;
  }
}

/**
 * Map Foundation Engine risk level to mystical UI status
 * @param {string} riskLevel - "green", "yellow", "red"
 * @returns {object} - {status, color, glow, mysticalLabel}
 */
export function mapRiskToMysticalStatus(riskLevel) {
  return RISK_MAPPING[riskLevel] || DEFAULT_RISK;
}

/**
 * Calculate progress percentage for tasks
 * @param {object} task - Foundation Engine task data
 * @returns {number} - Progress percentage 0-100
 */
export function calculateProgressFromSchedule(task) {
  // For now, return 0 for new projects
  // Later: could calculate based on current date vs scheduled dates
  if (task.scheduled_start_day === 0) {
    return 0; // Not started
  }

  // Future enhancement: calculate actual progress based on current date
  return Math.min(Math.round((task.scheduled_start_day / task.scheduled_finish_day) * 100), 100);
}

/**
 * Transform single Foundation Engine task for frontend display
 * @param {object} foundationTask - Raw Foundation Engine task
 * @param {string} startDate - Project start date
 * @param {number} index - Task index for fallback IDs
 * @returns {object} - Frontend-ready task object
 */
export function transformTaskForDisplay(foundationTask, startDate, index = 0) {
  const riskMapping = mapRiskToMysticalStatus(foundationTask.risk_level);
  const progress = calculateProgressFromSchedule(foundationTask);

  return {
    // Core identification
    id: foundationTask.id || `task-${index}`,
    name: foundationTask.name,
    title: foundationTask.name, // Some components expect 'title'

    // Scheduling - converted to calendar dates
    dueDate: businessDaysToCalendarDate(startDate, foundationTask.scheduled_finish_day),
    startDate: businessDaysToCalendarDate(startDate, foundationTask.scheduled_start_day),
    duration: foundationTask.duration_days,

    // Risk and status - mystical mapping
    status: riskMapping.status,
    risk_level: foundationTask.risk_level,
    risk_score: foundationTask.risk_score,
    color: riskMapping.color,
    glow: riskMapping.glow,
    mysticalLabel: riskMapping.mysticalLabel,

    // Progress and completion
    progress: progress,

    // Critical path analysis
    is_critical: foundationTask.is_critical,
    float_days: foundationTask.float_days,

    // Dependencies - for future Gantt/skill tree
    predecessors: foundationTask.predecessors || [],
    blocks_tasks: foundationTask.blocks_tasks || [],
    blocked_by_tasks: foundationTask.blocked_by_tasks || [],

    // Additional display fields
    assignee: "Foundation Engine", // Default assignee
    priority: foundationTask.is_critical ? "high" : "medium",
    description: `Duration: ${foundationTask.duration_days} days, Risk: ${foundationTask.risk_level}`,
    tags: foundationTask.is_critical ? ["critical-path", "foundation-engine"] : ["foundation-engine"]
  };
}

/**
 * Transform Foundation Engine subtask for subtask view
 * @param {object} foundationTask - Raw Foundation Engine task
 * @param {string} startDate - Project start date
 * @param {number} index - Task index
 * @returns {object} - Subtask-ready object
 */
export function transformSubtaskForDisplay(foundationTask, startDate, index = 0) {
  const riskMapping = mapRiskToMysticalStatus(foundationTask.risk_level);
  const progress = calculateProgressFromSchedule(foundationTask);

  return {
    id: foundationTask.id || `subtask-${index}`,
    name: foundationTask.name,

    // Status mapping for subtask view
    status: progress > 0 ? "in-progress" : "pending",
    progress: progress,

    // Calendar dates
    dueDate: businessDaysToCalendarDate(startDate, foundationTask.scheduled_finish_day),

    // Assignment
    assignee: foundationTask.is_critical ? "Critical Path" : "Auto",

      predecessors: foundationTask.predecessors || [],
      is_critical: foundationTask.is_critical || false,

    // Risk visualization
    risk_level: foundationTask.risk_level,
        color: riskMapping.color,
        glow: riskMapping.glow,
    is_critical: foundationTask.is_critical
  };
}

/**
 * MAIN TRANSFORMER: Convert complete Foundation Engine response to frontend project
 * @param {object} apiResponse - Full Foundation Engine API response
 * @param {string} startDate - Project start date "2025-09-14"
 * @param {object} originalProjectData - Original form data for fallbacks
 * @returns {object} - Complete frontend project object
 */
export function transformProjectResponse(apiResponse, startDate, originalProjectData = {}, options={}) {
  const projectMetrics = apiResponse.project_metrics;
  const foundationTasks = apiResponse.tasks;

  // Calculate project-level completion date
  const projectCompletionDate = businessDaysToCalendarDate(
    startDate,
    projectMetrics.total_duration_days
  );

  // Determine overall project status based on risk level
  const projectRiskMapping = mapRiskToMysticalStatus(projectMetrics.overall_risk_level);

  // Transform all tasks for different views
  const transformedTasks = foundationTasks.map((task, index) =>
    transformTaskForDisplay(task, startDate, index)
  );

  const transformedSubtasks = foundationTasks.map((task, index) =>
    transformSubtaskForDisplay(task, startDate, index)
  );

  // Count completed tasks (for progress calculation)
  const tasksCompleted = transformedTasks.filter(task => task.progress === 100).length;
  const overallProgress = Math.round((tasksCompleted / foundationTasks.length) * 100);

  return {
    // Project identification
    id: Date.now().toString(),
    name: apiResponse.project_name || originalProjectData.project_name || "Untitled Quest",
    description: `Foundation Engine calculated project with ${foundationTasks.length} sacred tasks`,

    // Project status and progress - based on Foundation Engine
    status: projectMetrics.overall_risk_level === 'green' ? 'safe' :
        projectMetrics.overall_risk_level === 'yellow' ? 'warning' : 'danger',
      progress: overallProgress,

    // Project timeline - Foundation Engine calculated
    dueDate: projectCompletionDate,
    startDate: format(parseISO(startDate), 'MMMM d, yyyy'),

    // Team and task metrics
    teamSize: originalProjectData.teamSize || 1,
    tasksCompleted: tasksCompleted,
    totalTasks: foundationTasks.length,

    // Critical path information
    criticalPathIds: projectMetrics.critical_path_ids,
    highRiskTaskCount: projectMetrics.high_risk_task_count,

    // Transformed task data for different views
    tasks: transformedTasks,
    subtasks: [],// Left this empty for now.

    // Foundation Engine metadata (for advanced features)
    foundationEngineData: {
      calculation_timestamp: apiResponse.calculation_timestamp,
      algorithms_used: apiResponse.algorithms_used,
      confidence_level: apiResponse.confidence_level,
      total_duration_days: projectMetrics.total_duration_days,
      overall_risk_level: projectMetrics.overall_risk_level,
      raw_tasks: foundationTasks // Keep for Gantt/skill tree
    }
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get critical path tasks for highlighting
 * @param {object} transformedProject - Project from transformProjectResponse
 * @returns {array} - Array of critical path task objects
 */
export function getCriticalPathTasks(transformedProject) {
  const criticalIds = transformedProject.criticalPathIds || [];
  return transformedProject.tasks.filter(task => criticalIds.includes(task.id));
}

/**
 * Get tasks grouped by risk level for analytics
 * @param {object} transformedProject - Project from transformProjectResponse
 * @returns {object} - {green: [], yellow: [], red: []}
 */
export function getTasksByRiskLevel(transformedProject) {
  const grouped = { green: [], yellow: [], red: [] };

  transformedProject.tasks.forEach(task => {
    if (grouped[task.risk_level]) {
      grouped[task.risk_level].push(task);
    }
  });

  return grouped;
}

/**
 * Calculate project health score for dashboard
 * @param {object} transformedProject - Project from transformProjectResponse
 * @returns {number} - Health score 0-100
 */
export function calculateProjectHealthScore(transformedProject) {
  const riskWeights = { green: 1, yellow: 0.7, red: 0.3 };
  const tasks = transformedProject.tasks;

  if (tasks.length === 0) return 100;

  const totalWeight = tasks.reduce((sum, task) => {
    return sum + (riskWeights[task.risk_level] || 0.5);
  }, 0);

  return Math.round((totalWeight / tasks.length) * 100);
}

// Export default object for easy importing
export default {
  transformProjectResponse,
  transformTaskForDisplay,
  transformSubtaskForDisplay,
  businessDaysToCalendarDate,
  mapRiskToMysticalStatus,
  getCriticalPathTasks,
  getTasksByRiskLevel,
  calculateProjectHealthScore
};