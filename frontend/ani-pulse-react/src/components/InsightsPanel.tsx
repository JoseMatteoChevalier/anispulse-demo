import React from 'react';

interface InsightsPanelProps {
  analysisData: any;
}

export function InsightsPanel({ analysisData }: InsightsPanelProps) {
  const insights = analysisData.pde_analysis.insights;
  const foundation = analysisData.foundation_results;
  const parameters = analysisData.parameters_used;

  return (
    <div className="bg-white p-6 rounded-lg border space-y-6">
      <h3 className="text-lg font-semibold mb-4">Analysis Insights</h3>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Risk Metrics</h4>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Risk Acceleration Factor</div>
            <div className="text-2xl font-bold text-blue-900">
              {insights.risk_acceleration_factor.toFixed(2)}x
            </div>
            <div className="text-sm text-blue-700">
              {insights.risk_acceleration_factor > 1.0
                ? 'PDE predicts faster completion due to risk management'
                : 'PDE shows risk-induced delays'
              }
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Critical Path Stability</div>
            <div className="text-2xl font-bold text-purple-900">
              {(insights.critical_path_stability * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-purple-700">
              Probability critical path remains unchanged
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Project Summary</h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tasks:</span>
              <span className="font-medium">{foundation.project_metrics.total_tasks}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Critical Path Tasks:</span>
              <span className="font-medium">{foundation.project_metrics.critical_path_ids.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">High Risk Tasks:</span>
              <span className="font-medium text-red-600">{foundation.project_metrics.high_risk_task_count}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Overall Risk Level:</span>
              <span className={`font-medium ${
                foundation.project_metrics.overall_risk_level === 'red' ? 'text-red-600' :
                foundation.project_metrics.overall_risk_level === 'yellow' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {foundation.project_metrics.overall_risk_level.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Project Duration:</span>
              <span className="font-medium">{foundation.project_metrics.total_duration_days} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parameters Used */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Simulation Parameters</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Diffusion:</span>
              <span className="ml-2 font-mono">{parameters.diffusion}</span>
            </div>
            <div>
              <span className="text-gray-600">Reaction Multiplier:</span>
              <span className="ml-2 font-mono">{parameters.reaction_multiplier}</span>
            </div>
            <div>
              <span className="text-gray-600">Max Delay:</span>
              <span className="ml-2 font-mono">{parameters.max_delay}</span>
            </div>
            <div>
              <span className="text-gray-600">Cascading:</span>
              <span className="ml-2 font-mono">{parameters.enable_cascading ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Computation Performance */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">Performance</h4>
        <div className="text-sm text-green-700">
          Analysis completed in <span className="font-mono font-bold">{analysisData.computation_time_seconds.toFixed(3)}s</span>
          {analysisData.computation_time_seconds < 1.0 && ' ⚡ Lightning fast!'}
        </div>
      </div>
    </div>
  );
}