// components/EnhancedPDEAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { useEnhancedPDE } from '../hooks/useEnhancedPDE';
import { ConfidenceBandsChart } from './ConfidenceBandsChart';
import { EnhancedGanttChart } from './EnhancedGanttChart';
import { InsightsPanel } from './InsightsPanel';

interface EnhancedPDEAnalysisProps {
  projectData: any; // Your existing project data structure
}

export function EnhancedPDEAnalysis({ projectData }: EnhancedPDEAnalysisProps) {
  const { analysisData, loading, error, runAnalysis, getDefaultParameters } = useEnhancedPDE();
  const [parameters, setParameters] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'comparison' | 'gantt' | 'confidence' | 'insights'>('comparison');

  useEffect(() => {
    // Load default parameters on mount
    getDefaultParameters().then(setParameters);
  }, [getDefaultParameters]);

  const handleRunAnalysis = () => {
    runAnalysis(projectData, parameters);
  };

  const chartData = analysisData ?
    analysisData.pde_analysis.simulation_time.map((time, index) => ({
      time: parseFloat(time.toFixed(2)),
      classical: analysisData.pde_analysis.classical_completion[index],
      pde: analysisData.pde_analysis.pde_completion[index]
    })) : [];

  return (
    <div className="enhanced-pde-analysis p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced PDE Risk Analysis</h2>
          <p className="text-gray-600">Advanced risk propagation simulation with confidence bands</p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run PDE Analysis'}
        </button>
      </div>

      {/* Parameter Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">PDE Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diffusion
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              max="0.1"
              value={parameters.diffusion || 0.025}
              onChange={(e) => setParameters(prev => ({ ...prev, diffusion: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reaction Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="5.0"
              value={parameters.reaction_multiplier || 2.0}
              onChange={(e) => setParameters(prev => ({ ...prev, reaction_multiplier: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Delay
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.2"
              value={parameters.max_delay || 0.05}
              onChange={(e) => setParameters(prev => ({ ...prev, max_delay: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={parameters.enable_cascading !== false}
                onChange={(e) => setParameters(prev => ({ ...prev, enable_cascading: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable Cascading</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900">Risk Acceleration</h4>
              <p className="text-2xl font-bold text-blue-600">
                {analysisData.pde_analysis.insights.risk_acceleration_factor.toFixed(2)}x
              </p>
              <p className="text-sm text-blue-700">
                PDE vs Classical completion speed
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900">Project Duration</h4>
              <p className="text-2xl font-bold text-green-600">
                {analysisData.foundation_results.project_metrics.total_duration_days} days
              </p>
              <p className="text-sm text-green-700">
                Critical path length
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900">Computation Time</h4>
              <p className="text-2xl font-bold text-purple-600">
                {analysisData.computation_time_seconds.toFixed(2)}s
              </p>
              <p className="text-sm text-purple-700">
                Analysis runtime
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'comparison', name: 'Risk Comparison', icon: '📈' },
                { id: 'confidence', name: 'Confidence Bands', icon: '📊' },
                { id: 'gantt', name: 'Enhanced Gantt', icon: '📅' },
                { id: 'insights', name: 'Insights', icon: '🔍' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'comparison' && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Classical vs PDE Risk Completion</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Time (days)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    label={{ value: 'Completion (0-1)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      (value * 100).toFixed(1) + '%',
                      name === 'classical' ? 'Classical Risk' : 'PDE Risk'
                    ]}
                    labelFormatter={(value: number) => `Day ${value}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="classical"
                    stroke="#1976d2"
                    strokeWidth={3}
                    name="Classical Risk"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pde"
                    stroke="#d32f2f"
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    name="PDE Risk"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'confidence' && (
            <ConfidenceBandsChart analysisData={analysisData} />
          )}

          {activeTab === 'gantt' && (
            <EnhancedGanttChart analysisData={analysisData} />
          )}

          {activeTab === 'insights' && (
            <InsightsPanel analysisData={analysisData} />
          )}
        </div>
      )}
    </div>
  );
}