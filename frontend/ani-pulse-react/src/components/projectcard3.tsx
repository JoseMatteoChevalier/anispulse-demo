


import { useState } from "react";
import { RotateCcw, Eye, Edit, BarChart3, Calendar, Sparkles, Brain, AlertTriangle, Layers, Clock, Zap } from "lucide-react";

interface Project {
  id?: string;
  name: string;
  description?: string;
  tasks: Array<{
    id: string;
    name: string;
    duration_days: number;
    predecessors: string[];
    user_risk_rating: number;
    completion_pct?: number;
    owner?: string;
  }>;
  project_start_date?: string;
  created?: string;
}

interface ProjectCardProps {
  project: Project;
  onViewTasks: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onViewGantt: (project: Project) => void;
  onViewAnalytics: (project: Project) => void;
  onSaveProject: (project: Project) => void;
}

interface GeminiInsights {
  risk_score: number;
  timeline_confidence: 'High' | 'Medium' | 'Low';
  top_concern: string;
  quick_win: string;
  status_emoji: string;
}

export function ProjectCard({
  project,
  onViewTasks,
  onEditProject,
  onViewGantt,
  onViewAnalytics,
  onSaveProject
}: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState<GeminiInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && !geminiInsights && !loadingInsights) {
      fetchGeminiInsights();
    }
  };

  const fetchGeminiInsights = async () => {
    setLoadingInsights(true);
    setInsightsError(null);

    try {
      const response = await fetch('https://anispulse2.onrender.com/api/gemini-quick-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: project.name,
          tasks: project.tasks.map(task => ({
            id: task.id,
            name: task.name,
            duration_days: task.duration_days,
            user_risk_rating: task.user_risk_rating,
            predecessors: task.predecessors || [],
            completion_pct: task.completion_pct || 0
          }))
        })
      });


      console.log('attempting to get data')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGeminiInsights(data.insights);
      } else if (data.fallback_insights) {
        setGeminiInsights(data.fallback_insights);
        setInsightsError("Using fallback analysis");
      } else {
        throw new Error(data.error || 'Failed to get insights');
      }

    } catch (err) {
      console.error('Gemini insights error:', err);
      setInsightsError(err.message);
      setGeminiInsights({
        risk_score: 5,
        timeline_confidence: 'Medium',
        top_concern: 'Monitor project progress and dependencies carefully',
        quick_win: 'Focus on completing high-risk tasks first',
        status_emoji: '📊'
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  // Calculate metrics
  const totalTasks = project.tasks.length;
  const avgRisk = totalTasks > 0 ? project.tasks.reduce((sum, t) => sum + t.user_risk_rating, 0) / totalTasks : 0;
  const totalDuration = project.tasks.reduce((sum, t) => sum + t.duration_days, 0);

  const getRiskColor = (score: number) => {
    if (score <= 3) return '#32CD32';
    if (score <= 6) return '#FFD700';
    return '#FF6B6B';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return '#32CD32';
      case 'Medium': return '#FFD700';
      case 'Low': return '#FF6B6B';
      default: return '#C9A876';
    }
  };

  return (
    <div className="group relative h-[270px] perspective-1000">
      <div className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>

        {/* Front Side - Enhanced Glass Morphism */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden">
          <div
            className="relative h-full border-2 p-4 flex flex-col backdrop-blur-sm shadow-inner ring-1"
            style={{
              background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)",
              borderColor: "#8B6914",
              boxShadow: "inset 0 1px 0 #D4AF3720, 0 4px 8px #00000060, 0 0 0 1px rgba(139, 105, 20, 0.2)",
              ringColor: "rgba(212, 175, 55, 0.2)"
            }}
          >
            {/* Animated glow line at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px glow-line"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)",
                opacity: 0.6
              }}
            />

            {/* Header with Edit Gear */}
            <div className="relative text-center mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
                className="absolute top-0 right-0 p-2 rounded-full transition-all hover:scale-110 hover:rotate-90 backdrop-blur-sm"
                style={{
                  background: "rgba(139, 105, 20, 0.2)",
                  border: "1px solid rgba(139, 105, 20, 0.5)",
                  color: "#D4AF37",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}
              >
                <Edit size={14} />
              </button>

              <h3
                className="text-xl mb-2"
                style={{
                  color: "#F4E4BC",
                  textShadow: "0 0 8px #D4AF3750, 0 2px 4px #00000080",
                  fontFamily: "serif",
                }}
              >
                {project.name}
              </h3>
              <div
                className="w-20 h-px mx-auto"
                style={{ background: "linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)" }}
              />
            </div>

            {/* Simplified Stats - Larger Text */}
            <div className="space-y-3 mb-4">
              {/* Tasks Widget */}
              <div
                className="backdrop-blur-md bg-white/5 border rounded-xl p-4 transition-all hover:translate-y-[-1px] hover:scale-[1.02] glass-widget"
                style={{
                  borderColor: "rgba(212, 175, 55, 0.3)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(212, 175, 55, 0.2)",
                        border: "1px solid rgba(212, 175, 55, 0.3)"
                      }}
                    >
                      <Layers size={18} style={{ color: "#D4AF37" }} />
                    </div>
                    <span style={{ color: "#C9A876", fontSize: "15px" }}>Tasks</span>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg backdrop-blur-sm"
                    style={{
                      background: "rgba(212, 175, 55, 0.15)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      color: "#F4E4BC",
                      fontSize: "20px",
                      fontWeight: "bold"
                    }}
                  >
                    {totalTasks}
                  </div>
                </div>
              </div>

              {/* Duration Widget */}
              <div
                className="backdrop-blur-md bg-white/5 border rounded-xl p-4 transition-all hover:translate-y-[-1px] hover:scale-[1.02] glass-widget"
                style={{
                  borderColor: "rgba(74, 144, 226, 0.3)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(74, 144, 226, 0.2)",
                        border: "1px solid rgba(74, 144, 226, 0.3)"
                      }}
                    >
                      <Clock size={18} style={{ color: "#4A90E2" }} />
                    </div>
                    <span style={{ color: "#C9A876", fontSize: "15px" }}>Duration</span>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg backdrop-blur-sm"
                    style={{
                      background: "rgba(74, 144, 226, 0.15)",
                      border: "1px solid rgba(74, 144, 226, 0.3)",
                      color: "#F4E4BC",
                      fontSize: "20px",
                      fontWeight: "bold"
                    }}
                  >
                    {totalDuration}d
                  </div>
                </div>
              </div>

              {/* Risk Widget */}
              <div
                className="backdrop-blur-md bg-white/5 border rounded-xl p-4 transition-all hover:translate-y-[-1px] hover:scale-[1.02] glass-widget risk-pulse"
                style={{
                  borderColor: avgRisk > 3 ? "rgba(255, 107, 107, 0.3)" : avgRisk > 2 ? "rgba(255, 215, 0, 0.3)" : "rgba(50, 205, 50, 0.3)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: avgRisk > 3 ? "rgba(255, 107, 107, 0.2)" : avgRisk > 2 ? "rgba(255, 215, 0, 0.2)" : "rgba(50, 205, 50, 0.2)",
                        border: `1px solid ${avgRisk > 3 ? "rgba(255, 107, 107, 0.3)" : avgRisk > 2 ? "rgba(255, 215, 0, 0.3)" : "rgba(50, 205, 50, 0.3)"}`
                      }}
                    >
                      <Zap size={18} style={{ color: avgRisk > 3 ? "#FF6B6B" : avgRisk > 2 ? "#FFD700" : "#32CD32" }} />
                    </div>
                    <span style={{ color: "#C9A876", fontSize: "15px" }}>Risk Level</span>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg backdrop-blur-sm"
                    style={{
                      background: avgRisk > 3 ? "rgba(255, 107, 107, 0.15)" : avgRisk > 2 ? "rgba(255, 215, 0, 0.15)" : "rgba(50, 205, 50, 0.15)",
                      border: `1px solid ${avgRisk > 3 ? "rgba(255, 107, 107, 0.3)" : avgRisk > 2 ? "rgba(255, 215, 0, 0.3)" : "rgba(50, 205, 50, 0.3)"}`,
                      color: "#F4E4BC",
                      fontSize: "20px",
                      fontWeight: "bold"
                    }}
                  >
                    {avgRisk.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer - but ensure minimum space for buttons */}
            <div className="flex-grow min-h-[8px]"></div>

            {/* Enhanced Action Buttons - Make sure they're visible */}
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewTasks(project);
                }}
                className="flex-1 py-2 px-3 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-1 backdrop-blur-sm border"
                style={{
                  background: "linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)",
                  color: "#F4E4BC",
                  borderColor: "#D4AF37",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px #00000040",
                  minHeight: "60px"
                }}
              >
                <Eye size={16} />
                <span>Details</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewGantt(project);
                }}
                className="flex-1 py-2 px-3 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-1 backdrop-blur-sm border"
                style={{
                  background: "rgba(45, 31, 31, 0.8)",
                  color: "#D4AF37",
                  borderColor: "rgba(139, 105, 20, 0.5)",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px #00000040",
                  minHeight: "60px"
                }}
              >
                <Calendar size={16} />
                <span>Gantt</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAnalytics(project);
                }}
                className="flex-1 py-2 px-3 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-1 backdrop-blur-sm border"
                style={{
                  background: "rgba(45, 31, 31, 0.8)",
                  color: "#D4AF37",
                  borderColor: "rgba(139, 105, 20, 0.5)",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px #00000040",
                  minHeight: "60px"
                }}
              >
                <BarChart3 size={16} />
                <span>Analytics</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="flex-1 py-2 px-3 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-1 ai-insights-button backdrop-blur-sm border"
                style={{
                  background: "linear-gradient(135deg, #1A2A1A, #2D3A2D)",
                  color: "#00FF88",
                  borderColor: "#00FF88",
                  fontSize: "12px",
                  boxShadow: "0 2px 8px rgba(0, 255, 136, 0.2)",
                  minHeight: "60px"
                }}
              >
                <Sparkles size={16} />
                <span>AI Oracle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Side - Gemini AI Oracle */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1B0F1F 0%, #2D1F2F 50%, #1B0F1F 100%)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 12px rgba(212,175,55,0.25)'
            }}
          >
            <div
              className="absolute inset-2 rounded-lg"
              style={{
                border: '2px solid #D4AF37',
                boxShadow: '0 0 8px rgba(212,175,55,0.3)'
              }}
            >
              <div className="p-4 h-full flex flex-col">
                {/* Header */}
                <div className="text-center mb-4">
                  <h3
                    className="text-lg font-serif font-bold mb-1"
                    style={{
                      color: '#F4E4BC',
                      textShadow: '0 0 8px rgba(244,228,188,0.3)'
                    }}
                  >
                    🔮 AI Oracle Speaks
                  </h3>
                  <div className="text-xs" style={{ color: '#00FF88' }}>
                    Powered by ♊️ AI
                  </div>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-2"></div>
                </div>

                {/* AI Insights Content */}
                <div className="flex-1">
                  {loadingInsights && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Brain size={32} className="mx-auto mb-3 ai-loading" style={{ color: '#00FF88' }} />
                      <p style={{ color: '#C9A876' }} className="text-sm text-center">
                        AI analyzing your project...
                      </p>
                      <div className="text-xs mt-2" style={{ color: '#8B6914' }}>
                        Gemini processing timeline and risks
                      </div>
                    </div>
                  )}

                  {insightsError && !geminiInsights && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: '#FF6B6B' }} />
                      <p style={{ color: '#FF6B6B' }} className="text-sm text-center">
                        Oracle temporarily unavailable
                      </p>
                      <div className="text-xs mt-2 text-center" style={{ color: '#C9A876' }}>
                        {insightsError}
                      </div>
                    </div>
                  )}

                  {geminiInsights && (
                    <div className="space-y-4">
                      {/* Risk Score & Status */}
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className="p-2 rounded text-center border"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            borderColor: getRiskColor(geminiInsights.risk_score)
                          }}
                        >
                          <div className="text-lg">{geminiInsights.status_emoji}</div>
                          <div className="text-sm font-bold" style={{ color: getRiskColor(geminiInsights.risk_score) }}>
                            Risk: {geminiInsights.risk_score}/10
                          </div>
                        </div>

                        <div
                          className="p-2 rounded text-center border"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            borderColor: getConfidenceColor(geminiInsights.timeline_confidence)
                          }}
                        >
                          <div className="text-sm font-bold" style={{ color: getConfidenceColor(geminiInsights.timeline_confidence) }}>
                            {geminiInsights.timeline_confidence}
                          </div>
                          <div className="text-xs" style={{ color: '#C9A876' }}>
                            Confidence
                          </div>
                        </div>
                      </div>

                      {/* Key Concern */}
                      <div
                        className="p-3 rounded border"
                        style={{
                          backgroundColor: 'rgba(255, 107, 107, 0.1)',
                          borderColor: '#FF6B6B'
                        }}
                      >
                        <div className="text-xs font-bold mb-1" style={{ color: '#FF6B6B' }}>
                          🚨 Key Risk
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#F4E4BC' }}>
                          {geminiInsights.top_concern}
                        </p>
                      </div>

                      {/* Quick Win */}
                      <div
                        className="p-3 rounded border"
                        style={{
                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          borderColor: '#00FF88'
                        }}
                      >
                        <div className="text-xs font-bold mb-1" style={{ color: '#00FF88' }}>
                          💡 Quick Win
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#F4E4BC' }}>
                          {geminiInsights.quick_win}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                  <button
                    onClick={handleFlip}
                    className="px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                    style={{
                      background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                      color: "#D4AF37",
                      border: "1px solid #8B6914",
                      fontSize: "12px"
                    }}
                  >
                    <RotateCcw size={12} />
                    Back to Project
                  </button>
                </div>

                {/* Mystical decorations */}
                <div className="absolute top-3 left-3 text-yellow-600 opacity-30">✦</div>
                <div className="absolute top-3 right-3 text-yellow-600 opacity-30">✧</div>
                <div className="absolute bottom-3 left-3 text-yellow-600 opacity-30">✧</div>
                <div className="absolute bottom-3 right-3 text-yellow-600 opacity-30">✦</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS for glass effects and animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .ai-insights-button {
          animation: sparkle-pulse 2s ease-in-out infinite;
        }
        .ai-loading {
          animation: ai-think 1.5s ease-in-out infinite;
        }
        .glass-widget {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .glass-widget:hover {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .glow-line {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .risk-pulse {
          animation: ${avgRisk > 3.5 ? 'risk-warning 2s ease-in-out infinite' : 'none'};
        }
        @keyframes sparkle-pulse {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(0, 255, 136, 0.2);
          }
          50% {
            box-shadow: 0 2px 12px rgba(0, 255, 136, 0.4);
          }
        }
        @keyframes ai-think {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes risk-warning {
          0%, 100% {
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          50% {
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
          }
        }
      `}</style>
    </div>
  );
}

