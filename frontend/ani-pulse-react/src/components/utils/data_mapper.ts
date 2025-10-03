// src/utils/dataMapper.ts
import { format, parseISO, addDays } from 'date-fns';

// Import your existing foundation engine adapter

// ===== BACKEND API TYPES =====
export interface BackendTask {
  id: string;
  name: string;
  duration_days: number;
  predecessors: string[];
  user_risk_rating: number;
  completion_pct?: number;
}

export interface BackendProjectRequest {
  project_name: string;
  tasks: BackendTask[];
}

export interface BackendProjectResponse {
  project: {
    name: string;
    total_duration: number;
    overall_risk_level: string;
    confidence_level: number;
  };
  tasks: Array<{
    id: string;
    name: string;
    duration_days: number;
    start_date: string;  // ISO string
    end_date: string;    // ISO string
    is_critical: boolean;
    risk_level: number;
    progress?: number;
  }>;
  critical_path: string[];
  calculations: {
    algorithm: string;
    timestamp: string;
  };
}

// ===== FRONTEND UI TYPES =====
export interface FrontendTask {
  id: string;
  name: string;
  title: string;           // For display
  duration: number;        // Days
  dueDate: string;        // Display format
  startDate: string;      // Display format
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;       // 0-100
  risk: number;          // 1-5
  dependencies: string[];
  isCritical?: boolean;
}

export interface FrontendProject {
  id: string;
  name: string;
  description: string;
  status: 'success' | 'warning' | 'danger';
  progress: number;
  startDate: string;
  dueDate: string;
  totalTasks: number;
  tasksCompleted: number;
  teamSize: number;
  highRiskTaskCount: number;
  tasks: FrontendTask[];
  subtasks: FrontendTask[];  // Same data, different presentation
  criticalPathIds: string[];
  foundationEngineData?: any;
}

// ===== DATA MAPPERS =====

export class DataMapper {

  /**
   * Convert form data to clean backend API format
   */
  static toBackendFormat(projectName: string, formTasks: any[]): BackendProjectRequest {
    const cleanTasks: BackendTask[] = formTasks
      .filter(task => task.name?.trim()) // Remove empty tasks
      .map(task => ({
        id: String(task.id),
        name: task.name.trim(),
        duration_days: Number(task.duration_days) || 1,
        predecessors: Array.isArray(task.predecessors) ? task.predecessors : [],
        user_risk_rating: Number(task.user_risk_rating) || 1,
        completion_pct: Number(task.completion_pct) || 0
      }));

    return {
      project_name: projectName.trim(),
      tasks: cleanTasks
    };
  }

  /**
   * Convert backend response to frontend project format
   * Uses foundationEngineAdapter for mystical UI enhancements
   */
  static toFrontendFormat(
    backendResponse: BackendProjectResponse,
    projectId: string,
    startDate?: string
  ): FrontendProject {

    // Use foundationEngineAdapter for mystical transformations
    // if (foundationEngineAdapter && typeof foundationEngineAdapter.transformProjectResponse === 'function') {
    //   try {
    //     // Try using existing foundation adapter first
    //     return foundationEngineAdapter.transformProjectResponse(
    //       backendResponse,
    //       startDate || format(new Date(), 'yyyy-MM-dd'),
    //       { project_name: backendResponse.project.name }
    //     );
    //   } catch (error) {
    //     console.warn('🔮 Foundation adapter failed, falling back to basic mapping:', error);
    //   }
    // }

    // Fallback to basic transformation
    return this.basicFrontendTransform(backendResponse, projectId, startDate);
  }

  /**
   * Basic transformation without mystical enhancements (fallback)
   */
  private static basicFrontendTransform(
    backendResponse: BackendProjectResponse,
    projectId: string,
    startDate?: string
  ): FrontendProject {

    const baseDate = new Date();

    // Convert tasks to frontend format
    const frontendTasks: FrontendTask[] = backendResponse.tasks.map(task => {
      const startDate = task.start_date ? parseISO(task.start_date) : baseDate;
      const endDate = task.end_date ? parseISO(task.end_date) : addDays(startDate, task.duration_days);

      return {
        id: task.id,
        name: task.name,
        title: task.name, // For display consistency
        duration: task.duration_days,
        startDate: format(startDate, 'MMMM d, yyyy'),
        dueDate: format(endDate, 'MMMM d, yyyy'),
        status: this.calculateTaskStatus(task.progress || 0, task.is_critical),
        progress: task.progress || 0,
        risk: task.risk_level || 1,
        dependencies: [], // Would need to reverse-engineer from predecessors
        isCritical: task.is_critical
      };
    });

    // Calculate project metrics
    const completedTasks = frontendTasks.filter(t => t.status === 'completed').length;
    const highRiskTasks = frontendTasks.filter(t => t.risk >= 4).length;
    const overallProgress = frontendTasks.length > 0
      ? Math.round(frontendTasks.reduce((sum, t) => sum + t.progress, 0) / frontendTasks.length)
      : 0;

    const projectStartDate = frontendTasks.length > 0
      ? frontendTasks[0].startDate
      : format(baseDate, 'MMMM d, yyyy');

    const projectEndDate = frontendTasks.length > 0
      ? format(addDays(baseDate, backendResponse.project.total_duration), 'MMMM d, yyyy')
      : format(addDays(baseDate, 30), 'MMMM d, yyyy');

    return {
      id: projectId,
      name: backendResponse.project.name,
      description: `Foundation Engine calculated project with ${frontendTasks.length} sacred tasks`,
      status: this.calculateProjectStatus(backendResponse.project.overall_risk_level, overallProgress),
      progress: overallProgress,
      startDate: projectStartDate,
      dueDate: projectEndDate,
      totalTasks: frontendTasks.length,
      tasksCompleted: completedTasks,
      teamSize: 1, // Default, could be calculated
      highRiskTaskCount: highRiskTasks,
      tasks: frontendTasks,
      subtasks: frontendTasks, // Same data for card display
      criticalPathIds: backendResponse.critical_path || [],
      foundationEngineData: {
        calculation_timestamp: backendResponse.calculations.timestamp,
        algorithms_used: [backendResponse.calculations.algorithm],
        confidence_level: backendResponse.project.confidence_level,
        total_duration_days: backendResponse.project.total_duration,
        overall_risk_level: backendResponse.project.overall_risk_level,
        critical_path_length: backendResponse.critical_path?.length || 0
      }
    };
  }

  /**
   * Calculate task status based on progress and criticality
   */
  private static calculateTaskStatus(
    progress: number,
    isCritical: boolean
  ): 'pending' | 'in-progress' | 'completed' | 'blocked' {
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'in-progress';
    if (isCritical && progress === 0) return 'blocked';
    return 'pending';
  }

  /**
   * Calculate project status based on risk and progress
   */
  private static calculateProjectStatus(
    riskLevel: string,
    progress: number
  ): 'success' | 'warning' | 'danger' {
    if (progress >= 90) return 'success';
    if (riskLevel === 'high' || riskLevel === 'red') return 'danger';
    if (riskLevel === 'medium' || riskLevel === 'yellow') return 'warning';
    return 'success';
  }

  /**
   * Validate data before sending to backend
   */
  static validateProjectData(projectName: string, tasks: any[]): string[] {
    const errors: string[] = [];

    if (!projectName?.trim()) {
      errors.push('Project name is required');
    }

    if (!tasks || tasks.length === 0) {
      errors.push('At least one task is required');
    }

    tasks.forEach((task, index) => {
      if (!task.name?.trim()) {
        errors.push(`Task ${index + 1}: Name is required`);
      }

      if (!task.duration_days || task.duration_days <= 0) {
        errors.push(`Task ${index + 1}: Duration must be positive`);
      }

// Allow decimal values 0-5:
      if (task.user_risk_rating != null && (task.user_risk_rating < 0 || task.user_risk_rating > 5)) {
        errors.push(`Task ${index + 1}: Risk rating must be between 0-5`);
      }

      if (task.completion_pct != null && (task.completion_pct < 0 || task.completion_pct > 100)) {
        errors.push(`Task ${index + 1}: Completion percentage must be between 0-100`);
      }
    });

    return errors;
  }

  /**
   * Debug: Log data transformation
   */
  static debugTransformation(stage: string, data: any) {
    console.log(`🔍 ${stage}:`, JSON.stringify(data, null, 2));
  }
}

// ===== USAGE EXAMPLE =====

/*
// In your Angular service:

submitProject(projectName: string, formTasks: any[]) {
  // 1. Validate
  const errors = DataMapper.validateProjectData(projectName, formTasks);
  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    return;
  }

  // 2. Transform to backend format
  const backendRequest = DataMapper.toBackendFormat(projectName, formTasks);
  DataMapper.debugTransformation('Backend Request', backendRequest);

  // 3. Send to API
  this.http.post<BackendProjectResponse>('/api/calculate-project', backendRequest)
    .subscribe({
      next: (backendResponse) => {
        DataMapper.debugTransformation('Backend Response', backendResponse);

        // 4. Transform to frontend format
        const frontendProject = DataMapper.toFrontendFormat(
          backendResponse,
          Date.now().toString()
        );

        DataMapper.debugTransformation('Frontend Project', frontendProject);

        // 5. Add to projects array
        this.projects.push(frontendProject);
      },
      error: (error) => console.error('API Error:', error)
    });
}
*/