import React from 'react';

interface EnhancedGanttChartProps {
  analysisData: any;
}

export function EnhancedGanttChart({ analysisData }: EnhancedGanttChartProps) {
  const ganttData = analysisData.pde_analysis.gantt_data;
  const maxDuration = analysisData.foundation_results.project_metrics.total_duration_days;

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Enhanced Gantt Chart</h3>

      <div className="space-y-2">
        {ganttData.tasks.map((task: any, index: number) => (
          <div key={task.id} className="flex items-center space-x-4">
            {/* Task name */}
            <div className="w-32 text-sm font-medium truncate">
              {task.name}
            </div>

            {/* Gantt bar container */}
            <div className="flex-1 relative h-8 bg-gray-100 rounded">
              {/* Task bar */}
              <div
                className={`absolute h-full rounded ${
                  task.is_critical 
                    ? 'bg-red-500' 
                    : task.risk_level === 'red' 
                      ? 'bg-orange-500'
                      : task.risk_level === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                }`}
                style={{
                  left: `${(task.start / maxDuration) * 100}%`,
                  width: `${(task.duration / maxDuration) * 100}%`
                }}
              >
                {/* Task duration label */}
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                  {task.duration}d
                </span>
              </div>

              {/* Float bar (if not critical) */}
              {!task.is_critical && task.float_days > 0 && (
                <div
                  className="absolute h-full bg-gray-300 opacity-50 rounded-r"
                  style={{
                    left: `${((task.start + task.duration) / maxDuration) * 100}%`,
                    width: `${(task.float_days / maxDuration) * 100}%`
                  }}
                />
              )}
            </div>

            {/* Task info */}
            <div className="w-20 text-xs text-gray-600">
              {task.is_critical ? (
                <span className="text-red-600 font-medium">Critical</span>
              ) : (
                <span>Float: {task.float_days.toFixed(1)}d</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Critical Path</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>High Risk</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Low Risk</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span>Float Time</span>
        </div>
      </div>
    </div>
  );
}