// hooks/useEnhancedPDE.ts
import { useState, useCallback } from 'react';

interface PDEParameters {
  diffusion: number;
  reaction_multiplier: number;
  max_delay: number;
  enable_cascading: boolean;
  enable_confidence_bands: boolean;
  confidence_levels: number[];
}

interface PDEAnalysisResponse {
  success: boolean;
  project_name: string;
  analysis_type: string;
  foundation_results: {
    project_metrics: {
      total_duration_days: number;
      overall_risk_level: string;
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
    confidence_bands: Record<string, { lower: number[]; upper: number[] }>;
    gantt_data: any;
    insights: {
      risk_acceleration_factor: number;
      critical_path_stability: number;
    };
  };
  computation_time_seconds: number;
  parameters_used: PDEParameters;
}

export function useEnhancedPDE() {
  const [analysisData, setAnalysisData] = useState<PDEAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (
    projectData: any,
    pdeParameters: Partial<PDEParameters> = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-pde-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          pde_parameters: pdeParameters
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisData(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDefaultParameters = useCallback(async (): Promise<PDEParameters> => {
    const response = await fetch('/api/pde-parameters/defaults');
    return response.json();
  }, []);

  return {
    analysisData,
    loading,
    error,
    runAnalysis,
    getDefaultParameters
  };
}