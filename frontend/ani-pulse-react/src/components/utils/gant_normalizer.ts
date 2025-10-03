// utils/ganttDataNormalizer.ts

export const normalizeFoundationData = (project: any) => {
    if (!project?.foundationResults?.tasks) return null;
    
    return {
      tasks: project.foundationResults.tasks.map(task => ({
        id: task.id,
        name: task.name,
        start_day: task.scheduled_start_day,
        end_day: task.scheduled_finish_day,
        duration: task.duration_days,
        is_critical: task.is_critical,
        risk_level: task.risk_level,
        completion_pct: project.tasks.find(t => t.id === task.id)?.completion_pct || 0
      })),
      maxDay: Math.max(...project.foundationResults.tasks.map(t => t.scheduled_finish_day)),
      projectStartDate: project.foundationResults.project_start_date
    };
  };
  
  export const normalizePDEData = (project: any) => {
    const pdeData = project?.analyticsCache?.pde?.analysis_results?.pde_analysis?.gantt_data 
      || project?.analyticsCache?.pde?.gantt_data;
    
    if (!pdeData?.tasks) return null;
    
    return {
      tasks: pdeData.tasks.map(task => ({
        id: task.id,
        name: task.name,
        start_day: task.start,
        end_day: task.end,
        duration: task.duration,
        is_critical: task.is_critical,
        risk_level: task.risk_level
      })),
      maxDay: Math.max(...pdeData.tasks.map(t => t.end)),
      projectStartDate: null
    };
  };
  
  export const normalizeMonteCarloData = (project: any) => {
    const mcData = project?.analyticsCache?.monteCarlo?.gantt_data;
    if (!mcData?.tasks) return null;
    
    return {
      tasks: mcData.tasks.map(task => ({
        id: task.id,
        name: task.name,
        start_day: task.start,
        end_day: task.end,
        duration: task.duration,
        is_critical: task.is_critical,
        risk_level: task.risk_level
      })),
      maxDay: Math.max(...mcData.tasks.map(t => t.end)),
      projectStartDate: null
    };
  };
  
  export const normalizeSDEData = (project: any) => {
    const sdeData = project?.analyticsCache?.sde?.gantt_data;
    if (!sdeData?.tasks) return null;
    
    return {
      tasks: sdeData.tasks.map(task => ({
        id: task.id,
        name: task.name,
        start_day: task.start,
        end_day: task.end,
        duration: task.duration,
        is_critical: task.is_critical,
        risk_level: task.risk_level
      })),
      maxDay: Math.max(...sdeData.tasks.map(t => t.end)),
      projectStartDate: null
    };
  };