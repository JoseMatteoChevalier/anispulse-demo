import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConfidenceBandsChartProps {
  analysisData: any; // We'll type this properly later
}

export function ConfidenceBandsChart({ analysisData }: ConfidenceBandsChartProps) {
  // Transform data for the chart
  const confidenceData = analysisData.pde_analysis.simulation_time.map((time: number, index: number) => {
    const dataPoint: any = {
      time: parseFloat(time.toFixed(2)),
      pde_mean: analysisData.pde_analysis.pde_completion[index]
    };

    // Add confidence bands if they exist
    if (analysisData.pde_analysis.confidence_bands) {
      Object.entries(analysisData.pde_analysis.confidence_bands).forEach(([level, band]: [string, any]) => {
        dataPoint[`lower_${level}`] = band.lower[index];
        dataPoint[`upper_${level}`] = band.upper[index];
      });
    }

    return dataPoint;
  });

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">PDE Completion with Confidence Bands</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={confidenceData}>
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
              name.replace('_', ' ').toUpperCase()
            ]}
            labelFormatter={(value: number) => `Day ${value}`}
          />
          <Legend />

          {/* 95% Confidence band */}
          {confidenceData[0]?.upper_95 && (
            <Area
              dataKey="upper_95"
              stroke="none"
              fill="#d32f2f15"
              name="95% Confidence"
            />
          )}

          {/* 90% Confidence band */}
          {confidenceData[0]?.upper_90 && (
            <Area
              dataKey="upper_90"
              stroke="none"
              fill="#d32f2f25"
              name="90% Confidence"
            />
          )}

          {/* Mean line */}
          <Line
            type="monotone"
            dataKey="pde_mean"
            stroke="#d32f2f"
            strokeWidth={3}
            name="PDE Mean"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}