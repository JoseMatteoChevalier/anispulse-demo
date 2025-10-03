import { useState, useRef ,useEffect } from "react"
import { ArrowLeft, Activity, Waves, BarChart3, Zap } from "lucide-react"
import { Line, Bar} from 'react-chartjs-2'
import { AnalyticsCacheService } from './utils/cache_service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface RiskAnalyticsProps {
  project: any
  onBack: () => void
  onProjectUpdate?: (project: any) => void
}

type SimulationType = "monte-carlo" | "sde" | "pde" | "risk-fusion"

const simulationOptions = [
  {
    id: "monte-carlo" as SimulationType,
    name: "Monte Carlo",
    icon: Activity,
    description: "Probabilistic risk analysis with confidence intervals",
  },
  {
    id: "sde" as SimulationType,
    name: "SDE Stochastic",
    icon: Waves,
    description: "Stochastic differential equation modeling",
  },
  {
    id: "pde" as SimulationType,
    name: "PDE Diffusion",
    icon: BarChart3,
    description: "Risk propagation through task dependencies",
  },
  {
    id: "risk-fusion" as SimulationType,
    name: "Risk Fusion",
    icon: Zap,
    description: "Combined multi-model risk assessment",
  },
]

// Helper function to find completion time (when curve reaches >= 0.95 or closest to 1.0)
const findCompletionTime = (timeArray: number[], progressArray: number[], threshold = 0.95) => {
  for (let i = 0; i < progressArray.length; i++) {
    if (progressArray[i] >= threshold) {
      return timeArray[i];
    }
  }
  // If never reaches threshold, return when it reaches maximum value
  const maxProgress = Math.max(...progressArray);
  const maxIndex = progressArray.indexOf(maxProgress);
  return timeArray[maxIndex];
};



function GanttChart({ ganttData, projectDuration, taskData }: {
  ganttData: any,
  projectDuration: number,
  taskData: any[]
}) {
  const [tooltip, setTooltip] = useState<{x:number, y:number, content:string} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);


  const getTooltipContent = (task: any, originalTask: any) => {
      const duration = Math.round(task.end - task.start);
      const risk = originalTask?.user_risk_rating || 0;
      const isCritical = criticalPath.includes(task.id);
      const dependencies = originalTask?.predecessors?.length || 0;

      return [
        `📋 ${task.name}`,
        `📅 Days ${task.start} → ${task.end} (${duration}d)`,
        `⚠️ Risk Level: ${risk}/5`,
        isCritical ? `🔴 CRITICAL PATH` : '',
        dependencies ? `🔗 Dependencies: ${dependencies}` : '📍 No Dependencies'
        ].filter(Boolean).join('\n');
    };

  // Make chart responsive
  useEffect(() => {
    const handleResize = () => {
      if(containerRef.current){
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!ganttData || !ganttData.tasks) {
    return (
      <div className="p-4 text-center" style={{ color: "#C9A876" }}>
        No Gantt data available
      </div>
    );
  }

  const tasks = ganttData.tasks;
  const criticalPath = ganttData.critical_path || [];

  const processedTasks = tasks.map((task, index) => {
    let start = task.start || task.start_time || task.earliest_start || 0;
    let end = task.end || task.end_time || task.finish_time || task.earliest_finish;

    if (!end && task.duration) end = start + task.duration;
    if (!end) {
      const originalTask = taskData.find(t => t.id === task.id);
      if (originalTask?.duration_days) end = start + originalTask.duration_days;
    }
    if (!end) { start = index * 10; end = start + 10; }

    return {
      ...task,
      start: Number(start) || 0,
      end: Number(end) || 10,
      name: task.name || task.task_name || `Task ${task.id || index + 1}`
    };
  }).filter(t => t.end > t.start);

  const leftMargin = 200;
  const chartHeight = Math.max(200, processedTasks.length * 60 + 80);
  const timelineEnd = Math.max(projectDuration-5, 100);
  const pixelsPerDay = Math.max(1, (containerWidth - leftMargin - 40) / timelineEnd);

  const taskMap = Object.fromEntries(taskData.map(t => [t.id, t]));

  const getMarkerInterval = (duration: number) => {
  if (duration <= 30) return 5;
  if (duration <= 90) return 10;
  if (duration <= 180) return 20;
  return 30;
    };


  const timeMarkers = [];
  const markerInterval = getMarkerInterval(timelineEnd);
  for (let i=0; i <= timelineEnd; i += markerInterval) timeMarkers.push(i);

  return (
    <div ref={containerRef} className="relative overflow-x-auto bg-black p-2 rounded">
      <svg
    width="100%"
    height={chartHeight}
    viewBox={`0 0 ${containerWidth} ${chartHeight}`}
    preserveAspectRatio="xMinYMin meet"
  >
        {/* Background */}
        <rect width={containerWidth} height={chartHeight} fill="rgba(15,10,10,0.8)" />

        {/* Grid */}
        {timeMarkers.map(time => {
          const x = leftMargin + time * pixelsPerDay;
          return (
            <g key={time}>
              <line x1={x} y1={40} x2={x} y2={chartHeight-20} stroke="#C9A876" strokeWidth={1}/>
              <text x={x} y={35} fill="#C9A876" fontSize="10" textAnchor="middle">Day {time}</text>
            </g>
          );
        })}

        {/* Axis */}
        <line x1={leftMargin} y1={40} x2={containerWidth-20} y2={40} stroke="#C9A876" strokeWidth={2}/>

        {/* Task bars */}
        {processedTasks.map((task, i) => {
          const y = 60 + i*60;
          const originalTask = taskMap[task.id];
          const isCritical = criticalPath.includes(task.id);
          const startX = leftMargin + task.start * pixelsPerDay;
          const endX = leftMargin + task.end * pixelsPerDay;
          const width = Math.max(2, endX - startX);

          let barColor = "#32CD32";
          let borderColor = "#2AA02A";
          const risk = originalTask?.user_risk_rating || 0;
          if(risk >= 4) { barColor="#FF6B6B"; borderColor="#FF4444"; }
          else if(risk >= 3) { barColor="#FFD700"; borderColor="#DAA520"; }
          if(isCritical) borderColor="#FF4444";

          return (
            <g key={task.id || i}>
              <text x={10} y={y+20} fill="#F4E4BC" fontSize="11">{task.name}</text>
              {isCritical && <text x={10} y={y+35} fill="#FF4444" fontSize="10">Critical</text>}

              <rect
                x={startX} y={y+5} width={width} height={25}
                fill={barColor} stroke={borderColor} strokeWidth={isCritical?3:1} rx={3}
                onMouseEnter={(e)=>{const originalTask = taskMap[task.id];
                setTooltip({x: e.clientX,y: e.clientY,content: getTooltipContent(task, originalTask)
                });
                }}
                onMouseLeave={()=>setTooltip(null)}
              />

              <text x={startX + width/2} y={y+22} fill="#000" fontSize="10" textAnchor="middle" fontWeight="bold">{Math.max(1, Math.round(task.end-task.start))}d</text>

              {risk>0 && <circle cx={endX+15} cy={y+17} r={8} fill={risk>=4?"#FF4444":risk>=3?"#FFD700":"#32CD32"} stroke="#FFF" strokeWidth={1}/>}
              {risk>0 && <text x={endX+15} y={y+22} fill="#000" fontSize="10" textAnchor="middle" fontWeight="bold">{risk}</text>}
            </g>
          );
        })}
      </svg>


        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
         <div className="p-3 rounded" style={{ backgroundColor: "rgba(50, 205, 50, 0.1)", borderLeft: "4px solid #32CD32" }}>
           <p style={{ color: "#32CD32", fontWeight: "bold" }}>Project Duration</p>
           <p style={{ color: "#FFF" }}>{ganttData.project_duration.toFixed(1) || Math.round(projectDuration)} days</p>
         </div>

         <div className="p-3 rounded" style={{ backgroundColor: "rgba(255, 68, 68, 0.1)", borderLeft: "4px solid #FF4444" }}>
           <p style={{ color: "#FF4444", fontWeight: "bold" }}>Critical Path Tasks</p>
           <p style={{ color: "#FFF" }}>{criticalPath.length} tasks</p>
         </div>

         <div className="p-3 rounded" style={{ backgroundColor: "rgba(255, 215, 0, 0.1)", borderLeft: "4px solid #FFD700" }}>
          <p style={{ color: "#FFD700", fontWeight: "bold" }}>High Risk Tasks</p>
           <p style={{ color: "#FFF" }}>{taskData.filter(t => t.user_risk_rating >= 4).length} tasks</p>
         </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:'fixed', left:tooltip.x+10, top:tooltip.y+10,
          backgroundColor:'#222', color:'#FFF', padding:'6px 8px',
          borderRadius:'4px', fontSize:'12px', whiteSpace:'pre'
        }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

export default GanttChart;



function MonteCarloAnalysis({ project, mode, onProjectUpdate }: { project: any; mode: "baseline" | "current_status"; onProjectUpdate?: (project: any) => void; }) {
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numSimulations, setNumSimulations] = useState(1000);
  const [confidenceLevels, setConfidenceLevels] = useState([80, 90, 95]);
  const [showAbout, setShowAbout] = useState(false);
  const [fullMonteCarloResponse, setFullMonteCarloResponse] = useState(null);
  const availableConfidenceLevels = [75, 80, 85, 90, 95, 99];


  console.log('🔍 MonteCarloAnalysis mounted with project:', {
    projectId: project.id,
    projectName: project.name,
    hasAnalyticsCache: !!project.analyticsCache,
    cacheKeys: project.analyticsCache ? Object.keys(project.analyticsCache) : [],
    hasMonteCarlo: !!project.analyticsCache?.monteCarlo
  });


  useEffect(() => {
    const cached = AnalyticsCacheService.loadFromCache(project, 'monteCarlo');
    if (cached) {
      console.log('✅ Loading Monte Carlo from cache');
      setFullMonteCarloResponse(cached);
      setMonteCarloResults(cached.analysis_results?.monte_carlo_analysis || cached);
    }
  }, [project]);


  const runAnalysis = async () => {
    setLoading(true);

    const requestData = {
      project_name: project.name,
      mode: mode,
      tasks: project.tasks.map(task => ({
        ...task,
        completion_pct: task.completion_pct || 0
      })),
      num_simulations: numSimulations,
      confidence_levels: confidenceLevels
    };

    console.log('🎲 Monte Carlo Request Data:', requestData);
    console.log('📊 Mode:', mode);
    console.log('🔍 Mode in request payload:', requestData.mode);
    console.log('🔍 Task completion percentages:', requestData.tasks.map(t => ({ id: t.id, name: t.name, completion_pct: t.completion_pct })));
    console.log('📋 Tasks Summary:', {
      count: project.tasks.length,
      avgDuration: project.tasks.reduce((sum, t) => sum + t.duration_days, 0) / project.tasks.length,
      avgRisk: project.tasks.reduce((sum, t) => sum + t.user_risk_rating, 0) / project.tasks.length,
      avgCompletion: project.tasks.reduce((sum, t) => sum + (t.completion_pct || 0), 0) / project.tasks.length
    });

    try {
      const response = await fetch('https://anispulse-demo.onrender.com/api/monte-carlo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎲 Monte Carlo API Response:', data.analysis_results?.monte_carlo_analysis);
      console.log('📊 Monte Carlo Results Summary:', {
        meanDuration: data.analysis_results?.monte_carlo_analysis?.project_statistics?.mean_duration,
        stdDuration: data.analysis_results?.monte_carlo_analysis?.project_statistics?.std_duration,
        minDuration: data.analysis_results?.monte_carlo_analysis?.project_statistics?.min_duration,
        maxDuration: data.analysis_results?.monte_carlo_analysis?.project_statistics?.max_duration,
      });

      setFullMonteCarloResponse(data);
      setMonteCarloResults(data.analysis_results?.monte_carlo_analysis);
      console.log('Project duration:', fullMonteCarloResponse?.project_metrics?.total_duration_days);
      console.log('Mean duration:', fullMonteCarloResponse?.analysis_results?.monte_carlo_analysis?.project_statistics?.mean_duration);
      console.log('Gantt data duration:', fullMonteCarloResponse?.gantt_data?.project_duration);
      console.log('Task 1 timeline:', fullMonteCarloResponse?.analysis_results?.monte_carlo_analysis?.task_timeline_statistics?.task_1);


      await AnalyticsCacheService.saveToCache(
        { cacheKey: 'monteCarlo', project, onProjectUpdate },
        data
      );

      console.log('After save, project.analyticsCache:', {
        keys: Object.keys(project.analyticsCache || {}),
        hasMC: !!project.analyticsCache?.monteCarlo
      });


    } catch (error) {
      console.error('Monte Carlo Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfidenceLevel = (level: number) => {
    setConfidenceLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level].sort((a, b) => a - b)
    );
  };

  // Get chart data for completion time distribution
  const getCompletionTimeChart = (results) => {
    if (!results?.all_completion_times) return null;

    // Create histogram data
    const completionTimes = results.all_completion_times;
    const min = Math.min(...completionTimes);
    const max = Math.max(...completionTimes);
    const bins = 20;
    const binWidth = (max - min) / bins;

    const histogram = Array(bins).fill(0);
    completionTimes.forEach(time => {
      const binIndex = Math.min(Math.floor((time - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    const labels = Array(bins).fill(0).map((_, i) =>
      Math.round(min + (i + 0.5) * binWidth)
    );

    return {
      labels,
      datasets: [{
        label: 'Project Completion Probability',
        data: histogram.map(count => (count / completionTimes.length) * 100),
        backgroundColor: 'rgba(50, 205, 50, 0.6)',
        borderColor: '#32CD32',
        borderWidth: 2
      }],
        meanValue: results.project_statistics?.mean_duration,
        classicalValue: results.project_statistics?.deterministic_duration // if available
    };
  };

  const histogramOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
          display:false,
        labels: { color: '#C9A876' }
      },
      title: {
        display: true,
        text: 'Project Completion Time Distribution',
        color: '#F4E4BC',
        font: { size: 16, family: 'serif' }
     }
    },
    scales: {
      x: {
        title: { display: true, text: 'Days', color: '#C9A876' },
        ticks: { color: '#C9A876' },
        grid: { color: 'rgba(201, 168, 118, 0.1)' }
      },
      y: {
        title: { display: true, text: 'Probability (%)', color: '#C9A876' },
        ticks: { color: '#C9A876' },
        grid: { color: 'rgba(201, 168, 118, 0.1)' }
      }
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl" style={{ color: "#F4E4BC", textShadow: "0 0 8px #D4AF3750" }}>
          🎲 Monte Carlo Risk Analysis </h3>
        <div className="text-lg mt-1" style={{
          color: mode === "baseline" ? "#32CD32" : "#FFD700",
          textShadow: "0 0 4px currentColor"
        }}>
          ({mode === "baseline" ? "📊 Project Baseline" : "⏱️ Current Status"})
        </div>


      {/* About Section */}
      <div
        className="p-4 rounded-lg border cursor-pointer"
        style={{
          borderColor: "#32CD32",
          backgroundColor: "rgba(50, 205, 50, 0.1)"
        }}
        onClick={() => setShowAbout(!showAbout)}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "#32CD32" }}>ℹ️ About Monte Carlo Analysis</span>
          <span style={{ color: "#C9A876" }}>
            {showAbout ? "▼" : "▶"}
          </span>
        </div>
        {showAbout && (
          <div className="mt-2 space-y-2">
            <p className="text-sm" style={{ color: "#C9A876" }}>
              Monte Carlo simulation runs thousands of "what-if" scenarios using 3-point estimation
              (optimistic, most likely, pessimistic) based on task risk ratings. Results show probability
              distributions and confidence intervals for project completion.
            </p>
            <div className="text-sm" style={{ color: "#8B6914" }}>
              <strong style={{ color: mode === "baseline" ? "#32CD32" : "#FFD700" }}>
                {mode === "baseline" ? "📊 Baseline Mode:" : "⏱️ Current Status Mode:"}
              </strong>
              {mode === "baseline"
                ? " Analyzes original task durations without any completion progress"
                : " Factors in current completion percentages - completed portions are removed from analysis"
              }
            </div>
          </div>
        )}
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number of Simulations */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)",
            borderColor: "#8B6914",
          }}
        >
          <h4 className="text-lg mb-4" style={{ color: "#F4E4BC" }}>
            Number of Simulations
          </h4>
          <input
            type="number"
            min="100"
            max="10000"
            step="100"
            value={numSimulations}
            onChange={(e) => setNumSimulations(parseInt(e.target.value))}
            className="w-full p-3 rounded text-lg text-center"
            style={{
              backgroundColor: "#1A0E0E",
              color: "#F4E4BC",
              border: "2px solid #8B6914"
            }}
          />
          <p className="text-xs mt-2" style={{ color: "#C9A876" }}>
            More simulations = more accurate results (but slower)
          </p>
        </div>

        {/* Confidence Levels */}
        <div
          className="p-4 rounded-lg border"
          style={{
            background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)",
            borderColor: "#8B6914",
          }}
        >
          <h4 className="text-lg mb-4" style={{ color: "#F4E4BC" }}>
            Confidence Levels
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {availableConfidenceLevels.map(level => (
              <button
                key={level}
                onClick={() => toggleConfidenceLevel(level)}
                className="p-2 rounded text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: confidenceLevels.includes(level) ? "#32CD32" : "#3D2A2A",
                  color: confidenceLevels.includes(level) ? "#000" : "#C9A876",
                  border: `1px solid ${confidenceLevels.includes(level) ? "#32CD32" : "#8B6914"}`
                }}
              >
                {level}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Run Analysis Button */}
      <button
        onClick={runAnalysis}
        disabled={loading || confidenceLevels.length === 0}
        className="w-full py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
        style={{
          backgroundColor: loading ? "#666" : "#32CD32",
          color: "#000",
          fontSize: "18px",
          fontWeight: "bold",
          border: "2px solid #32CD32"
        }}
      >
        {loading ? "🔄 Running Monte Carlo Analysis..." : "🎲 Run Monte Carlo Analysis"}
      </button>

      {monteCarloResults && (
        <div className="space-y-6">
          {/* Statistical Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#32CD32",
                backgroundColor: "rgba(50, 205, 50, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#32CD32" }}>
                {monteCarloResults.project_statistics?.mean_duration?.toFixed(1)} days
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>Mean Duration</div>
            </div>

            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#FFD700",
                backgroundColor: "rgba(255, 215, 0, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#FFD700" }}>
                ±{monteCarloResults.project_statistics?.std_duration?.toFixed(1)} days
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>Std Deviation</div>
            </div>

            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#8B3F8B",
                backgroundColor: "rgba(139, 63, 139, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#8B3F8B" }}>
                {monteCarloResults.project_statistics?.min_duration?.toFixed(0)}-{monteCarloResults.project_statistics?.max_duration?.toFixed(0)}
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>Range (days)</div>
            </div>

            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#FF6B6B",
                backgroundColor: "rgba(255, 107, 107, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#FF6B6B" }}>
                {((monteCarloResults.project_statistics?.std_duration / monteCarloResults.project_statistics?.mean_duration) * 100)?.toFixed(1)}%
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>Risk Factor</div>
            </div>
          </div>

          {/* Confidence Intervals */}
          <div
            className="p-6 rounded-lg border-2"
            style={{
              borderColor: "#D4AF37",
              backgroundColor: "rgba(212, 175, 55, 0.1)"
            }}
          >
            <h5 className="text-xl mb-4" style={{ color: "#D4AF37" }}>
              Confidence Intervals
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {confidenceLevels.map(level => {
                const interval = monteCarloResults.confidence_intervals?.[level.toString()];
                return interval ? (
                  <div key={level} className="text-center p-4 rounded" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <div className="text-lg mb-1" style={{ color: "#F4E4BC" }}>
                      {level}% Confidence
                    </div>
                    <div className="text-xl" style={{ color: "#D4AF37" }}>
                      {interval.lower?.toFixed(1)} - {interval.upper?.toFixed(1)} days
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Completion Time Distribution Chart */}
          {monteCarloResults.all_completion_times && (
            <div
              className="p-6 rounded-lg border-2"
              style={{
                borderColor: "#32CD32",
                backgroundColor: "rgba(26, 26, 26, 0.8)"
              }}
            >
              <div style={{ height: '400px' }}>
                <Bar data={getCompletionTimeChart(monteCarloResults)} options={histogramOptions} />
              </div>
            </div>
          )}

 {fullMonteCarloResponse?.gantt_data && (
  <div
    className="p-6 rounded-lg border-2 mt-6"
    style={{
      borderColor: "#32CD32",
      backgroundColor: "rgba(26, 26, 26, 0.8)"
    }}
  >
    <h5 className="text-xl mb-4" style={{ color: "#32CD32" }}>
      Monte Carlo Gantt Chart (90% Confidence Bands)
    </h5>
    <GanttChart
      ganttData={fullMonteCarloResponse?.gantt_data}
      projectDuration={monteCarloResults.project_statistics?.mean_duration}
      taskData={project.tasks}
    />
  </div>
)}


          {/* Task Criticality Analysis */}
          {monteCarloResults.task_criticality && (
            <div
              className="p-6 rounded-lg border-2"
              style={{
                borderColor: "#FF6B6B",
                backgroundColor: "rgba(26, 26, 26, 0.8)"
              }}
            >
              <h5 className="text-xl mb-4" style={{ color: "#FF6B6B" }}>
                Task Criticality (% Time on Critical Path)
              </h5>
              <div className="space-y-2">
                {project.tasks.map((task, index) => {
                  const criticality = monteCarloResults.task_criticality[index];
                  return (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded"
                         style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                      <span style={{ color: "#F4E4BC" }}>{task.name}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-32 h-4 rounded border"
                          style={{
                            backgroundColor: "#2D1F1F",
                            borderColor: "#8B6914"
                          }}
                        >
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${criticality}%`,
                              backgroundColor: criticality > 80 ? "#FF4444" :
                                             criticality > 50 ? "#FFD700" : "#32CD32"
                            }}
                          />
                        </div>
                        <span style={{
                          color: criticality > 80 ? "#FF4444" :
                                 criticality > 50 ? "#FFD700" : "#32CD32"
                        }}>
                          {criticality?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function
SDEAnalysis({
  project, 
  mode, 
  onProjectUpdate 
}: { 
  project: any; 
  mode: "baseline" | "current_status";
  onProjectUpdate?: (project: any) => void;  // ← ADD THIS
}) {
  const [sdeResults, setSDEResults] = useState(null);
  const [sdeLoading, setSDELoading] = useState(false);
  const [fullSDEResponse, setFullSDEResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [showAbout, setShowAbout] = useState(false);


  useEffect(() => {
    if (project.analyticsCache?.sde) {
      console.log('✅ Loading cached SDE results');
      
      const cachedData = project.analyticsCache.sde;

      if (cachedData.sde_analysis) {
        setSDEResults(cachedData.sde_analysis);
        setFullSDEResponse(cachedData);  // Also set the full response for GANTT
      } else {
        // It's already just the sde_analysis
        setSDEResults(cachedData);
    }
  }
  }, [project]);


  // Save SDE results to cache
  const saveSDEToCache = async (sdeData: any) => {
    const updatedProject = {
      ...project,
      analyticsCache: {
        ...project.analyticsCache,
        sde: sdeData
      }
    };
    
    try {
      console.log('💾 Saving SDE to cache...');
      
      // Save to backend
      const projectData = {
        id: updatedProject.id || Date.now().toString(),
        name: updatedProject.name,
        description: updatedProject.description || "",
        project_start_date: updatedProject.project_start_date,
        tasks: updatedProject.tasks.map(task => ({
          id: task.id,
          name: task.name,
          owner: task.owner,
          duration_days: task.duration_days,
          predecessors: task.predecessors || [],
          user_risk_rating: task.user_risk_rating,
          completion_pct: task.completion_pct || 0
        })),
        foundationResults: updatedProject.foundationResults || null,
        analyticsCache: updatedProject.analyticsCache || null,
        created: updatedProject.created || new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const response = await fetch('https://anispulse-demo.onrender.com/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend save failed:', errorText);
        return;
      }
      
      console.log('✅ SDE persisted to MongoDB');

      // Update parent component
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
        console.log('✅ SDE cached in memory');
      }
      
      console.log('✅ SDE cached successfully!');
    } catch (error) {
      console.error('Failed to persist SDE, but kept in memory:', error);
    }
  };

  // Async polling function
  const pollJobStatus = async (jobId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`https://anispulse-demo.onrender.com/api/sde-status/${jobId}`);
          const status = await statusResponse.json();

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            resolve(status.result);
          } else if (status.status === 'error') {
            clearInterval(pollInterval);
            reject(new Error(status.error));
          } else if (status.status === 'processing') {
            if (status.progress) {
              setProgress(status.progress);
            }
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000);
    });
  };

  const runAnalysis = async () => {
    setLoading(true);
    setProgress("Initializing SDE analysis...");

    try {
      const response = await fetch('https://anispulse-demo.onrender.com/api/sde-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: project.name,
          tasks: project.tasks.map(task => ({
            ...task,
            completion_pct: task.completion_pct || 0
          })),
          mode: mode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { job_id } = await response.json();
      console.log('SDE Job started:', job_id);

      const result = await pollJobStatus(job_id);
      console.log('SDE Analysis completed:', result);
      console.log('🧮 SDE API Response:', result);

      setSDEResults(result.sde_analysis);
      setFullSDEResponse(result); // Store full response for GANTT data
      setProgress("Analysis complete!");

      await saveSDEToCache(result);
      console.log('🧮 SDE Data Saved to Cache:', result);

    } catch (error) {
      console.error('SDE Analysis failed:', error);
      setProgress(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(""), 3000);
    }
  };

  // Prepare histogram data
  const getCompletionHistogram = (completionTimes) => {
    if (!completionTimes) return null;

    const min = Math.min(...completionTimes);
    const max = Math.max(...completionTimes);
    const bins = 20;
    const binWidth = (max - min) / bins;

    const histogram = Array(bins).fill(0);
    completionTimes.forEach(time => {
      const binIndex = Math.min(Math.floor((time - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    const labels = Array(bins).fill(0).map((_, i) =>
      Math.round(min + (i + 0.5) * binWidth)
    );

    return {
      labels,
      datasets: [{
        label: 'Completion Time Distribution',
        data: histogram.map(count => (count / completionTimes.length) * 100),
        backgroundColor: 'rgba(0, 206, 209, 0.6)',
        borderColor: '#00CED1',
        borderWidth: 2
      }],
    };
  };

  // GANTT Chart rendering function
  const renderGanttChart = () => {
    if (!fullSDEResponse?.gantt_data) {
      return (
        <div className="p-6 text-center" style={{ color: "#C9A876" }}>
          No GANTT data available from SDE analysis
        </div>
      );
    }

    const ganttData = fullSDEResponse.gantt_data;
    
    // SDE returns parallel arrays, not an array of task objects
    const taskCount = ganttData.task_names?.length || 0;
    if (taskCount === 0) {
      return (
        <div className="p-6 text-center" style={{ color: "#C9A876" }}>
          No task data in GANTT response
        </div>
      );
    }

    const projectDuration = ganttData.project_completion?.mean || 
                           Math.max(...ganttData.finish_times);

    return (
      <div className="space-y-4">
        {/* Project Header */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xl" style={{ color: "#F4E4BC" }}>
              SDE-Adjusted Timeline
            </h4>
            <p className="text-sm" style={{ color: "#C9A876" }}>
              Mean Project Duration: {projectDuration.toFixed(1)} days
            </p>
          </div>
          <div className="text-sm" style={{ color: "#00CED1" }}>
            Success Rate: {((ganttData.project_completion?.success_rate || 0) * 100).toFixed(0)}%
          </div>
        </div>

        {/* Task Bars */}
        <div className="space-y-4">
          {ganttData.task_names.map((taskName, index) => {
            const startTime = ganttData.start_times[index];
            const duration = ganttData.durations[index];
            const plannedDuration = ganttData.planned_durations[index];
            const riskLevel = ganttData.risk_levels[index];
            const scheduleVariance = ganttData.schedule_variance[index];
            
            const startPercent = (startTime / projectDuration) * 100;
            const widthPercent = (duration / projectDuration) * 100;
            
            // Color based on risk level (0-5 scale)
            let barColor = "#32CD32"; // Green for low risk (0-1)
            if (riskLevel >= 4) {
              barColor = "#FF6B6B"; // Red for very high risk
            } else if (riskLevel >= 3) {
              barColor = "#FFB84D"; // Orange for high risk
            } else if (riskLevel >= 2) {
              barColor = "#F9DC5C"; // Yellow for medium risk
            }
            
            // Check if significantly over planned duration
            const isOverSchedule = scheduleVariance > 1;

            return (
              <div key={index} className="relative">
                {/* Task Name and Details */}
                <div className="flex items-center mb-2">
                  <div className="w-1/4 pr-4" style={{ color: "#F4E4BC" }}>
                    <div className="font-semibold text-sm">{taskName}</div>
                    <div className="text-xs mt-1" style={{ color: "#C9A876" }}>
                      Risk: {riskLevel}/5
                      {isOverSchedule && <span style={{ color: "#FF6B6B" }}> | +{scheduleVariance.toFixed(1)}d</span>}
                    </div>
                  </div>
                  
                  {/* Timeline Bar */}
                  <div className="w-3/4 relative h-10">
                    {/* Background grid */}
                    <div className="absolute inset-0 border-l border-r"
                         style={{ borderColor: "rgba(201, 168, 118, 0.15)" }}>
                    </div>
                    
                    {/* Task Bar */}
                    <div
                      className="absolute h-full rounded-md transition-all hover:opacity-90 cursor-pointer shadow-lg"
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: barColor,
                        border: isOverSchedule ? "2px solid #FF0000" : "none",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-sm font-bold" 
                           style={{ color: "#000" }}>
                        {duration.toFixed(1)}d
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Scale */}
        <div className="flex w-3/4 ml-auto mt-4 text-xs font-medium" style={{ color: "#C9A876" }}>
          <div className="w-0 text-left">Day 0</div>
          <div className="flex-1 text-center">Day {Math.round(projectDuration / 2)}</div>
          <div className="w-0 text-right">Day {projectDuration.toFixed(0)}</div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mt-6 pt-4 border-t-2" 
             style={{ borderColor: "rgba(0, 206, 209, 0.3)", color: "#C9A876" }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-md" style={{ backgroundColor: "#FF6B6B" }}></div>
            <span className="text-xs">Very High Risk (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-md" style={{ backgroundColor: "#FFB84D" }}></div>
            <span className="text-xs">High Risk (3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-md" style={{ backgroundColor: "#F9DC5C" }}></div>
            <span className="text-xs">Medium Risk (2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded shadow-md" style={{ backgroundColor: "#32CD32" }}></div>
            <span className="text-xs">Low Risk (0-1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border-2" style={{ borderColor: "#FF0000", backgroundColor: "rgba(255, 107, 107, 0.2)" }}></div>
            <span className="text-xs">Over Planned</span>
          </div>
        </div>
      </div>
    );
  };

  const histogramOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#C9A876' }
      },
      title: {
        display: true,
        text: 'SDE Stochastic Completion Time Distribution',
        color: '#F4E4BC',
        font: { size: 16, family: 'serif' }
      },
      tooltip: {
        backgroundColor: 'rgba(45, 31, 31, 0.95)',
        titleColor: '#F4E4BC',
        bodyColor: '#C9A876',
        borderColor: '#00CED1',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => `Day ${context[0].label}`,
          label: (context) => `Probability: ${context.raw.toFixed(2)}%`,
          afterLabel: (context) => {
            const totalDays = sdeResults?.completion_times?.length || 0;
            const binCount = Math.round((context.raw / 100) * totalDays);
            return `Scenarios: ${binCount}/${totalDays}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Project Duration (Days)', color: '#C9A876' },
        ticks: {
          color: '#C9A876',
          maxTicksLimit: 15
        },
        grid: { color: 'rgba(201, 168, 118, 0.1)' }
      },
      y: {
        title: { display: true, text: 'Probability (%)', color: '#C9A876' },
        ticks: {
          color: '#C9A876',
          callback: (value) => `${value.toFixed(1)}%`
        },
        grid: { color: 'rgba(201, 168, 118, 0.1)' }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl" style={{ color: "#F4E4BC", textShadow: "0 0 8px #D4AF3750" }}>
        🌊 SDE Stochastic Analysis
        <span className="text-lg ml-4" style={{
          color: mode === "baseline" ? "#32CD32" : "#FFD700",
          textShadow: "0 0 4px currentColor"
        }}>
          ({mode === "baseline" ? "📊 Baseline Plan" : "⏱️ Current Status"})
        </span>
      </h3>

      {/* About Section */}
      <div
        className="p-4 rounded-lg border cursor-pointer"
        style={{
          borderColor: "#00CED1",
          backgroundColor: "rgba(0, 206, 209, 0.1)"
        }}
        onClick={() => setShowAbout(!showAbout)}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "#00CED1" }}>ℹ️ About SDE Analysis</span>
          <span style={{ color: "#C9A876" }}>
            {showAbout ? "▼" : "▶"}
          </span>
        </div>
        {showAbout && (
          <p className="mt-2 text-sm" style={{ color: "#C9A876" }}>
            Stochastic Differential Equations model project risk as continuous random processes,
            capturing volatility and uncertainty propagation through task dependencies. Results show
            probabilistic completion scenarios with advanced mathematical modeling that runs in the background.
          </p>
        )}
      </div>

      {/* Run Analysis Button */}
      <div className="space-y-4">
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="w-full py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
          style={{
            backgroundColor: loading ? "#666" : "#00CED1",
            color: "#000",
            fontSize: "18px",
            fontWeight: "bold",
            border: "2px solid #00CED1"
          }}
        >
          {loading ? "🔄 Running SDE Simulation..." : "🌊 Run SDE Analysis"}
        </button>

        {/* Progress Indicator */}
        {loading && progress && (
          <div
            className="p-4 rounded-lg border"
            style={{
              borderColor: "#00CED1",
              backgroundColor: "rgba(0, 206, 209, 0.1)"
            }}
          >
            <div className="flex items-center gap-2">
              <div className="animate-spin">⏳</div>
              <span style={{ color: "#00CED1" }}>{progress}</span>
            </div>
            <div className="mt-2 text-sm" style={{ color: "#C9A876" }}>
              Advanced mathematical simulation in progress... This may take 1-2 minutes.
            </div>
          </div>
        )}
      </div>

      {sdeResults && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#00CED1",
                backgroundColor: "rgba(0, 206, 209, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#00CED1" }}>
                {sdeResults.mean_duration?.toFixed(1)} days
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>Mean Duration</div>
            </div>

            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#48CAE4",
                backgroundColor: "rgba(72, 202, 228, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#48CAE4" }}>
                ±{sdeResults.std_duration?.toFixed(1)} days
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>Volatility (σ)</div>
            </div>

            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#0077BE",
                backgroundColor: "rgba(0, 119, 190, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#0077BE" }}>
                {sdeResults.var_95?.toFixed(1)} days
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>95% VaR</div>
            </div>

            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{
                borderColor: "#32CD32",
                backgroundColor: "rgba(50, 205, 50, 0.1)"
              }}
            >
              <div className="text-2xl mb-1" style={{ color: "#32CD32" }}>
                {(sdeResults.prob_on_time * 100)?.toFixed(0)}%
              </div>
              <div className="text-sm" style={{ color: "#C9A876" }}>On-Time Probability</div>
            </div>
          </div>

          {/* GANTT Chart Section */}
          {fullSDEResponse?.gantt_data && (
            <div
              className="p-6 rounded-lg border-2"
              style={{
                borderColor: "#00CED1",
                backgroundColor: "rgba(26, 26, 26, 0.8)"
              }}
            >
              <h4 className="text-xl mb-4" style={{ color: "#00CED1" }}>
                📊 SDE Risk-Adjusted Schedule
              </h4>
              {renderGanttChart()}
            </div>
          )}

          {/* Completion Time Distribution */}
          {sdeResults.completion_times && (
            <div
              className="p-6 rounded-lg border-2"
              style={{
                borderColor: "#00CED1",
                backgroundColor: "rgba(26, 26, 26, 0.8)"
              }}
            >
              <div style={{ height: '400px' }}>
                <Line
                  data={getCompletionHistogram(sdeResults.completion_times)}
                  options={histogramOptions}
                />
              </div>
            </div>
          )}

          {/* Risk Interpretation */}
          <div
            className="p-6 rounded-lg border-2"
            style={{
              borderColor: "#8B3F8B",
              backgroundColor: "rgba(139, 63, 139, 0.1)"
            }}
          >
            <h5 className="text-xl mb-4" style={{ color: "#8B3F8B" }}>
              SDE Risk Interpretation
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-2" style={{ color: "#C9A876" }}>
                  <strong style={{ color: "#00CED1" }}>Mean Duration:</strong> Expected completion time from stochastic differential equation modeling
                </p>
                <p className="text-sm mb-2" style={{ color: "#C9A876" }}>
                  <strong style={{ color: "#48CAE4" }}>Volatility (σ):</strong> Mathematical measure of timeline uncertainty and random fluctuations
                </p>
              </div>
              <div>
                <p className="text-sm mb-2" style={{ color: "#C9A876" }}>
                  <strong style={{ color: "#0077BE" }}>95% VaR:</strong> Value at Risk - worst-case duration at 95% statistical confidence
                </p>
                <p className="text-sm mb-2" style={{ color: "#C9A876" }}>
                  <strong style={{ color: "#32CD32" }}>On-Time Probability:</strong> Likelihood of completing within baseline timeline
                </p>
              </div>
            </div>

            {/* Technical Note */}
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: "rgba(0, 206, 209, 0.1)" }}>
              <p className="text-xs" style={{ color: "#00CED1" }}>
                <strong>Technical:</strong> This analysis uses advanced stochastic differential equations
                running sophisticated Monte Carlo simulations with 100+ paths. Calculations performed
                asynchronously in the background using production mathematical engines.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function PDEAnalysis({ project, mode, onProjectUpdate }: { project: any; mode: "baseline" | "current_status" ; onProjectUpdate?: (project: any) => void;}) {
  const [pdeResults, setPdeResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fullPdeResponse, setFullPdeResponse] = useState(null);




  useEffect(() => {
    const cached = AnalyticsCacheService.loadFromCache(project, 'pde');
    if (cached) {
      console.log('✅ Loading PDE from cache');
      setFullPdeResponse(cached);
      setPdeResults(cached.analysis_results?.pde_analysis || cached);
    }
  }, [project]);


  const runAnalysis = async () => {

      const requestData = {
      project_name: project.name,
      tasks: project.tasks.map(task => ({
        ...task,
        completion_pct: task.completion_pct || 0
      })),
      mode: mode
    };

    console.log('📊 PDE Request Data:', requestData);
    console.log('📊 Mode:', mode);
    console.log('🔍 PDE Task completion percentages:', requestData.tasks.map(t => ({ id: t.id, name: t.name, completion_pct: t.completion_pct })));
    console.log('📋 Tasks Summary (PDE):', {
      count: project.tasks.length,
      avgDuration: project.tasks.reduce((sum, t) => sum + t.duration_days, 0) / project.tasks.length,
      avgRisk: project.tasks.reduce((sum, t) => sum + t.user_risk_rating, 0) / project.tasks.length,
      avgCompletion: project.tasks.reduce((sum, t) => sum + (t.completion_pct || 0), 0) / project.tasks.length,
      totalDuration: project.tasks.reduce((sum, t) => sum + t.duration_days, 0)
    });

    setLoading(true);
    try {
      const response = await fetch('https://anispulse-demo.onrender.com/api/enhanced-pde-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 PDE API Response:', data);
      console.log('📊 PDE Analysis:', data.analysis_results?.pde_analysis);

      const insights = getKeyInsights(data.analysis_results?.pde_analysis);
      console.log('📊 PDE Results Summary:', {
        classicalCompletion: insights?.classicalCompletion,
        pdeCompletion: insights?.pdeCompletion,
        delayImpact: insights?.delayImpact,
        projectDuration: data.gantt_data?.project_duration,  // Fixed
        maxSimulationTime: data.analysis_results?.pde_analysis?.simulation_time?.slice(-1)[0]
      });

      setFullPdeResponse(data);  // Add this
      setPdeResults(data.analysis_results?.pde_analysis);

      await AnalyticsCacheService.saveToCache(
        { cacheKey: 'pde', project, onProjectUpdate },
        data);

    } catch (error) {
      console.error('PDE Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract key insights from API data
  const getKeyInsights = (results) => {
    if (!results) return null;

    const classicalCompletion = findCompletionTime(results.simulation_time, results.classical_completion);
    const pdeCompletion = findCompletionTime(results.simulation_time, results.pde_completion);
    const delayImpact = pdeCompletion - classicalCompletion;

    const finalClassical = results.classical_completion[results.classical_completion.length - 1];
    const finalPde = results.pde_completion[results.pde_completion.length - 1];
    const maxTime = results.simulation_time[results.simulation_time.length - 1];

    return {
      classicalCompletion: finalClassical >= 0.95 ? classicalCompletion : null,
      pdeCompletion: finalPde >= 0.95 ? pdeCompletion : null,
      delayImpact: delayImpact,
      finalClassical: finalClassical,
      finalPde: finalPde,
      maxTime: maxTime,
      riskFactor: results.insights?.risk_acceleration_factor || 0,
      criticalStability: results.insights?.critical_path_stability || 0
    };
  };

  const insights = getKeyInsights(pdeResults);

  // Prepare Chart.js data
  const getChartData = (results) => {
    if (!results) return null;

    // Downsample data for better performance (take every 10th point)
    const step = Math.max(1, Math.floor(results.simulation_time.length / 1000));
    const timeData = results.simulation_time.filter((_, i) => i % step === 0);
    const classicalData = results.classical_completion.filter((_, i) => i % step === 0);
    const pdeData = results.pde_completion.filter((_, i) => i % step === 0);

    return {
      labels: timeData,
      datasets: [
        {
          label: 'Classical Completion',
          data: classicalData,
          borderColor: '#32CD32',
          backgroundColor: 'rgba(50, 205, 50, 0.1)',
          borderWidth: 3,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.1,
        },
        {
          label: 'PDE Diffusion',
          data: pdeData,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderWidth: 3,
          borderDash: [10, 5],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.1,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#C9A876',
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: 'Project Completion Curves',
        color: '#F4E4BC',
        font: {
          size: 18,
          family: 'serif'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(45, 31, 31, 0.95)',
        titleColor: '#F4E4BC',
        bodyColor: '#C9A876',
        borderColor: '#D4AF37',
        borderWidth: 1,
        callbacks: {
          title: (context) => `Day ${context[0].label}`,
          label: (context) => `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (Days)',
          color: '#C9A876',
          font: {
            size: 14,
          }
        },
        grid: {
          color: 'rgba(201, 168, 118, 0.1)',
        },
        ticks: {
          color: '#C9A876',
          maxTicksLimit: 10,
        }
      },
      y: {
        title: {
          display: true,
          text: 'Progress (0-100%)',
          color: '#C9A876',
          font: {
            size: 14,
          }
        },
        grid: {
          color: 'rgba(201, 168, 118, 0.1)',
        },
        ticks: {
          color: '#C9A876',
          callback: (value) => `${(value * 100).toFixed(0)}%`,
        },
        min: 0,
        max: 1.0,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl" style={{ color: "#F4E4BC" }}>
          📊 PDE Diffusion Analysis </h3>
        <div className="text-lg mt-1" style={{
          color: mode === "baseline" ? "#32CD32" : "#FFD700",
          textShadow: "0 0 4px currentColor"
        }}>
          ({mode === "baseline" ? "📊 Project Baseline" : "⏱️ Current Status"})
        </div>

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="px-6 py-3 rounded-lg border transition-all hover:scale-105"
        style={{
          backgroundColor: loading ? "#666" : "#FF6B6B",
          color: "#FFF",
          borderColor: "#FF6B6B",
          boxShadow: "0 4px 8px rgba(255, 107, 107, 0.3)"
        }}
      >
        {loading ? "🔄 Running Analysis..." : "🚀 Run PDE Analysis"}
      </button>

      {pdeResults && insights && (
        <div className="space-y-6">
          {/* Enhanced Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg border-2"
              style={{
                borderColor: "#32CD32",
                backgroundColor: "rgba(50, 205, 50, 0.1)",
                boxShadow: "0 0 10px rgba(50, 205, 50, 0.2)"
              }}
            >
              <h5 className="text-lg mb-2" style={{ color: "#32CD32" }}>Classical Path</h5>
              <p className="text-2xl mb-1" style={{ color: "#FFF" }}>
                {insights.finalClassical >= 0.95
                  ? `${insights.classicalCompletion?.toFixed(1)} days`
                  : `${(insights.finalClassical * 100).toFixed(1)}%`
                }
              </p>
              <p className="text-xs" style={{ color: "#C9A876" }}>
                {insights.finalClassical >= 0.95 ? "Completed" : "Incomplete"}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border-2"
              style={{
                borderColor: "#FF6B6B",
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                boxShadow: "0 0 10px rgba(255, 107, 107, 0.2)"
              }}
            >
              <h5 className="text-lg mb-2" style={{ color: "#FF6B6B" }}>PDE with Risk</h5>
              <p className="text-2xl mb-1" style={{ color: "#FFF" }}>
                {insights.finalPde >= 0.95
                  ? `${insights.pdeCompletion?.toFixed(1)} days`
                  : `${(insights.finalPde * 100).toFixed(1)}%`
                }
              </p>
              <p className="text-xs" style={{ color: "#C9A876" }}>
                {insights.finalPde >= 0.95 ? "Completed" : "Risk-Limited"}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border-2"
              style={{
                borderColor: "#FFD700",
                backgroundColor: "rgba(255, 215, 0, 0.1)",
                boxShadow: "0 0 10px rgba(255, 215, 0, 0.2)"
              }}
            >
              <h5 className="text-lg mb-2" style={{ color: "#FFD700" }}>Risk Impact</h5>
              <p className="text-2xl mb-1" style={{ color: "#FFF" }}>
                {insights.delayImpact > 0
                  ? `+${insights.delayImpact.toFixed(1)} days`
                  : "No Delay"
                }
              </p>
              <p className="text-xs" style={{ color: "#C9A876" }}>
                Risk Factor: {insights.riskFactor.toFixed(2)}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border-2"
              style={{
                borderColor: "#8B3F8B",
                backgroundColor: "rgba(139, 63, 139, 0.1)",
                boxShadow: "0 0 10px rgba(139, 63, 139, 0.2)"
              }}
            >
              <h5 className="text-lg mb-2" style={{ color: "#8B3F8B" }}>Critical Stability</h5>
              <p className="text-2xl mb-1" style={{ color: "#FFF" }}>
                {(insights.criticalStability * 100).toFixed(0)}%
              </p>
              <p className="text-xs" style={{ color: "#C9A876" }}>
                Path Reliability
              </p>
            </div>
          </div>

          {/* Enhanced Chart with Chart.js */}
          <div
            className="p-6 rounded-lg border-2"
            style={{
              borderColor: "#FFD700",
              backgroundColor: "rgba(26, 26, 26, 0.8)",
              boxShadow: "0 0 20px rgba(255, 215, 0, 0.1)"
            }}
          >
            <div className="mb-4 flex justify-between items-center">
              <h5 className="text-xl" style={{ color: "#FFD700" }}>
                Project Completion Analysis
              </h5>
              <div className="text-sm" style={{ color: "#888" }}>
                Data Points: {pdeResults.classical_completion?.length.toLocaleString()} |
                Simulation Time: {insights.maxTime.toFixed(0)} days
              </div>
            </div>

            <div style={{ height: '400px' }}>
              <Line
                data={getChartData(pdeResults)}
                options={chartOptions}
              />
            </div>

            {/* Project Status Alert */}
            {insights.finalClassical < 0.95 && (
              <div
                className="mt-4 p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: "rgba(255, 107, 107, 0.1)",
                  borderLeftColor: "#FF6B6B"
                }}
              >
                <p style={{ color: "#FF6B6B", fontWeight: "bold" }}>
                  ⚠️ Project Risk Alert
                </p>
                <p style={{ color: "#C9A876" }}>
                  Neither scenario reaches completion within {insights.maxTime.toFixed(0)} days.
                  Consider extending timeline or reducing task complexity.
                </p>
              </div>
            )}
          </div>

          {/* Gantt Chart Visualization */}
          <div
            className="p-6 rounded-lg border-2"
            style={{
              borderColor: "#8B3F8B",
              backgroundColor: "rgba(26, 26, 26, 0.8)",
              boxShadow: "0 0 20px rgba(139, 63, 139, 0.1)"
            }}
          >
            <div className="mb-4">
              <h5 className="text-xl mb-2" style={{ color: "#8B3F8B" }}>
                Task Timeline & Risk Analysis
              </h5>
              <p className="text-sm" style={{ color: "#C9A876" }}>
                Gantt view showing task dependencies and risk propagation effects
              </p>
            </div>

            <GanttChart
              ganttData={fullPdeResponse?.analysis_results?.pde_analysis?.gantt_data || fullPdeResponse?.gantt_data}
              projectDuration={insights.maxTime}
              taskData={fullPdeResponse?.gantt_data.tasks}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RiskFusionAnalysis({ project, mode }: { project: any; mode: "baseline" | "current_status" }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl" style={{ color: "#F4E4BC", textShadow: "0 0 8px #D4AF3750" }}>
        ⚡ Risk Fusion Analysis
        <span className="text-lg ml-4" style={{
          color: mode === "baseline" ? "#32CD32" : "#FFD700",
          textShadow: "0 0 4px currentColor"
        }}>
          ({mode === "baseline" ? "📊 Baseline Plan" : "⏱️ Current Status"})
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="p-6 rounded-lg border-2"
          style={{
            background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)",
            borderColor: "#D4AF37",
          }}
        >
          <h4 className="text-lg mb-4" style={{ color: "#F4E4BC" }}>
            Model Comparison
          </h4>
          <div className="space-y-3">
            {[
              { model: "Classical", duration: "38.2 days", color: "#32CD32" },
              { model: "Monte Carlo", duration: "42.3 days", color: "#FFD700" },
              { model: "PDE", duration: "45.8 days", color: "#FF6B6B" },
              { model: "SDE", duration: "44.1 days", color: "#00CED1" },
            ].map((result, index) => (
              <div key={index} className="flex justify-between items-center">
                <span style={{ color: "#C9A876" }}>{result.model}:</span>
                <span style={{ color: result.color }}>{result.duration}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-6 rounded-lg border-2"
          style={{
            background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)",
            borderColor: "#8B3F8B",
          }}
        >
          <h4 className="text-lg mb-4" style={{ color: "#F4E4BC" }}>
            Risk Consensus
          </h4>
          <div className="text-center">
            <div className="text-3xl mb-2" style={{ color: "#8B3F8B" }}>
              43.6 days
            </div>
            <div className="text-sm" style={{ color: "#C9A876" }}>
              Weighted Average Duration
            </div>
            <div className="mt-4 text-sm" style={{ color: "#8B6914" }}>
              Confidence: 87%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RiskAnalytics({ project, onBack, onProjectUpdate }: RiskAnalyticsProps) {
  const [selectedSimulation, setSelectedSimulation] = useState<SimulationType>("pde")
  const [isCalculating, setIsCalculating] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<"baseline" | "current_status">("baseline")



  const renderSimulation = () => {
    switch (selectedSimulation) {
      case "monte-carlo":
        return <MonteCarloAnalysis project={project} mode={analysisMode} />
      case "sde":
        return <SDEAnalysis project={project} mode={analysisMode} />
      case "pde":
        return <PDEAnalysis project={project} mode={analysisMode} />
      case "risk-fusion":
        return <RiskFusionAnalysis project={project} mode={analysisMode} />
      default:
        return <MonteCarloAnalysis project={project} mode={analysisMode} />
    }
  }




  const handleRunSimulation = async () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
    }, 2000)
  }

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0F0A0A 0%, #1A0E0E 25%, #2D1B1B 50%, #1A0E0E 75%, #0F0A0A 100%)",
      }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-0 w-full h-px opacity-10"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #D4AF37 20%, #CD853F 50%, #D4AF37 80%, transparent 100%)",
          }}
        />
      </div>

      <header className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)",
                color: "#D4AF37",
                border: "2px solid #8B6914",
                boxShadow: "inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040",
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1
                className="text-4xl mb-1"
                style={{
                  color: "#F4E4BC",
                  textShadow: "0 0 12px #D4AF3750, 0 2px 4px #00000080",
                  fontFamily: "serif",
                }}
              >
                Risk Analytics
              </h1>
              <p
                className="text-lg italic"
                style={{
                  color: "#C9A876",
                  textShadow: "0 1px 2px #00000060"
                }}
              >
                {project.name} - Advanced Simulation Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mode Selection Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "#C9A876" }}>Analysis Mode:</span>
              <div className="flex rounded-lg border-2" style={{ borderColor: "#8B6914" }}>
                <button
                  onClick={() => setAnalysisMode("baseline")}
                  className="px-2 py-2 text-sm transition-all"
                  style={{
                    backgroundColor: analysisMode === "baseline" ? "#D4AF37" : "transparent",
                    color: analysisMode === "baseline" ? "#000" : "#C9A876",
                    borderTopLeftRadius: "4px",
                    borderBottomLeftRadius: "4px"
                  }}
                >
                  📊 Baseline
                </button>
                <button
                  onClick={() => setAnalysisMode("current_status")}
                  className="px-2 py-2 text-sm transition-all"
                  style={{
                    backgroundColor: analysisMode === "current_status" ? "#D4AF37" : "transparent",
                    color: analysisMode === "current_status" ? "#000" : "#C9A876",
                    borderTopRightRadius: "4px",
                    borderBottomRightRadius: "4px"
                  }}
                > ⏱️Current State
                </button>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isCalculating}
              className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{
                background: isCalculating
                  ? "linear-gradient(135deg, #8B6914 0%, #D4AF37 100%)"
                  : "linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 50%, #8B3F8B 100%)",
                color: "#F4E4BC",
                border: "2px solid #D4AF37",
                boxShadow: "inset 0 1px 0 #D4AF3740, 0 4px 8px #00000060",
              }}
            >
              {isCalculating ? "🔄 Calculating..." : "🚀 Run Simulation"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {simulationOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedSimulation === option.id

            return (
              <button
                key={option.id}
                onClick={() => setSelectedSimulation(option.id)}
                className="p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-left"
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)"
                    : "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)",
                  borderColor: isSelected ? "#D4AF37" : "#8B6914",
                  boxShadow: isSelected
                    ? "0 0 15px #D4AF3740, inset 0 1px 0 #D4AF3720"
                    : "inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} style={{ color: isSelected ? "#D4AF37" : "#C9A876" }} />
                  <span className="font-medium" style={{ color: isSelected ? "#F4E4BC" : "#C9A876" }}>
                    {option.name}
                  </span>
                </div>
                <p className="text-sm" style={{ color: isSelected ? "#C9A876" : "#8B6914" }}>
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto relative z-10">
        <div
          className="p-8 rounded-lg border-2"
          style={{
            background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)",
            borderColor: "#8B6914",
            boxShadow: "inset 0 1px 0 #D4AF3720, 0 4px 8px #00000060",
          }}
        >
          {renderSimulation()}
        </div>
      </main>
    </div>
  )
}