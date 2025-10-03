import { useState } from "react";
import { RotateCcw, Eye, Edit } from "lucide-react";
import { Project } from "../../types/index";

interface ProjectCardProps {
  project: Project;
  onViewTasks: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onSaveProject: (project: Project) => void;
}
// Staging
export function ProjectCard({ project, onViewTasks, onEditProject, onSaveProject }: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  // Calculate metrics using the correct index.ts structure
  const totalTasks = project.tasks.length;
  const avgRisk = totalTasks > 0 ? project.tasks.reduce((sum, t) => sum + t.user_risk_rating, 0) / totalTasks : 0;
  const totalDuration = project.tasks.reduce((sum, t) => sum + t.duration_days, 0);

  // Calculate completion status based on task dependencies and progression
  const completedTasks = project.tasks.filter(task => {
    // You might want to add a 'completed' field to your Task interface
    // For now, we'll use a placeholder logic
    return false; // Replace with actual completion logic
  }).length;

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="group relative h-[210px] perspective-1000">
      <div className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>

        {/* Front Side - Project Overview */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden"
          onClick={handleFlip}
          style={{ cursor: "pointer" }}
        >
          <div
            className="relative h-full border-2 p-3"
            style={{
              background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)",
              borderColor: "#8B6914",
              boxShadow: "inset 0 1px 0 #D4AF3720, 0 4px 8px #00000060",
            }}
          >
            {/* Ornate corners */}
            {[
              { top: "1px", left: "1px", clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)" },
              { top: "1px", right: "1px", clipPath: "polygon(100% 0%, 100% 100%, 0% 0%)" },
              { bottom: "1px", left: "1px", clipPath: "polygon(0% 100%, 100% 100%, 0% 0%)" },
              { bottom: "1px", right: "1px", clipPath: "polygon(100% 100%, 0% 100%, 100% 0%)" },
            ].map((style, idx) => (
              <div
                key={idx}
                className="absolute w-4 h-4 opacity-40"
                style={{ ...style, background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
              />
            ))}

            {/* Header */}
            <div className="text-center mb-4">
              <h3
                className="text-lg mb-2"
                style={{
                  color: "#F4E4BC",
                  textShadow: "0 0 8px #D4AF3750, 0 2px 4px #00000080",
                  fontFamily: "serif",
                }}
              >
                {project.name}
              </h3>
              <div
                className="w-16 h-px mx-auto"
                style={{ background: "linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)" }}
              />
            </div>

            {/* Project Stats - Using correct field names */}
            <div className="space-y-2">
              <div
                className="p-2 rounded border-2"
                style={{
                  background: "linear-gradient(90deg, #2D1F1F, #3D2A2A)",
                  borderColor: "#8B6914",
                }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: "#C9A876", fontSize: "14px" }}>Total Tasks</span>
                  <span style={{ color: "#F4E4BC", fontSize: "16px" }}>{totalTasks}</span>
                </div>
              </div>

              <div
                className="p-2 rounded border-2"
                style={{
                  background: "linear-gradient(90deg, #2D1F1F, #3D2A2A)",
                  borderColor: "#8B6914",
                }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: "#C9A876", fontSize: "14px" }}>Total Duration</span>
                  <span style={{ color: "#F4E4BC", fontSize: "16px" }}>{totalDuration} days</span>
                </div>
              </div>

              <div
                className="p-2 rounded border-2"
                style={{
                  background: "linear-gradient(90deg, #2D1F1F, #3D2A2A)",
                  borderColor: "#8B6914",
                }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: "#C9A876", fontSize: "14px" }}>Average Risk</span>
                  <span
                    style={{
                      color: avgRisk > 3 ? "#FF6B6B" : avgRisk > 2 ? "#FFD700" : "#32CD32",
                      fontSize: "16px"
                    }}
                  >
                    {avgRisk.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "#C9A876" }}>Completion</span>
                <span style={{ color: "#F4E4BC" }}>{completionPercentage.toFixed(0)}%</span>
              </div>
              <div
                className="h-2 rounded-full border"
                style={{
                  backgroundColor: "#2D1F1F",
                  borderColor: "#8B6914"
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${completionPercentage}%`,
                    background: "linear-gradient(90deg, #32CD3280, #32CD32, #32CD3280)",
                  }}
                />
              </div>
            </div>

            {/* Flip Indicator */}
            <div
              className="absolute bottom-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ color: "#D4AF37" }}
            >
              <RotateCcw size={18} />
            </div>
          </div>
        </div>

        {/* Back Side - Task List with PROPER SCROLLING */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg overflow-hidden">
          <div
            className="relative h-full border-2"
            style={{
              background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)",
              borderColor: "#8B6914",
            }}
          >
            {/* Fixed layout container */}
            <div className="h-full flex flex-col p-3">

              {/* Header section */}
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h3
                  className="text-lg"
                  style={{
                    color: "#F4E4BC",
                    fontFamily: "serif",
                    textShadow: "0 0 8px #CD853F50, 0 2px 4px #00000080"
                  }}
                >
                  Project Tasks
                  <div
                    className="w-12 h-px mx-auto mt-2"
                    style={{ background: "linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)" }}
                  />
                </h3>
                <button
                  onClick={handleFlip}
                  className="p-2 rounded transition-all hover:scale-110"
                  style={{
                    color: "#D4AF37",
                    background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                    border: "1px solid #8B6914"
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* SCROLLABLE task list - using index.ts field names */}
              <div className="flex-1 mb-3 overflow-y-auto">
                <div className="space-y-2 pr-2">
                  {project.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded border relative"
                      style={{
                        background: "linear-gradient(135deg, #3D2A2A 0%, #4A3131 50%, #3D2A2A 100%)",
                        borderColor: "#8B6914",
                        boxShadow: "inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040"
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: "#F4E4BC",
                            textShadow: "0 1px 2px #00000060"
                          }}
                        >
                          {task.name}
                        </span>
                        <div
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            background: `linear-gradient(135deg, ${
                              task.user_risk_rating > 3 ? "#FF6B6B15" :
                              task.user_risk_rating > 2 ? "#FFD70015" : "#32CD3215"
                            }, ${
                              task.user_risk_rating > 3 ? "#FF6B6B25" :
                              task.user_risk_rating > 2 ? "#FFD70025" : "#32CD3225"
                            })`,
                            color: task.user_risk_rating > 3 ? "#FF6B6B" :
                                   task.user_risk_rating > 2 ? "#FFD700" : "#32CD32",
                            border: `1px solid ${
                              task.user_risk_rating > 3 ? "#FF6B6B60" :
                              task.user_risk_rating > 2 ? "#FFD70060" : "#32CD3260"
                            }`,
                            textShadow: "0 1px 2px #00000080"
                          }}
                        >
                          Risk: {task.user_risk_rating}/5
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <span style={{ color: "#C9A876" }}>
                          Duration: {task.duration_days} days
                        </span>
                        <span style={{ color: "#C9A876" }}>
                          Dependencies: {task.predecessors.length}
                        </span>
                      </div>

                      {/* Show dependencies if any */}
                      {task.predecessors.length > 0 && (
                        <div className="text-xs" style={{ color: "#8B6914" }}>
                          Depends on: {task.predecessors.join(", ")}
                        </div>
                      )}

                      {/* Subtle inner glow based on risk */}
                      <div
                        className="absolute inset-0 rounded opacity-20 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${
                            task.user_risk_rating > 3 ? "#FF6B6B10" :
                            task.user_risk_rating > 2 ? "#FFD70010" : "#32CD3210"
                          } 0%, transparent 70%)`
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons - FIXED POSITION at bottom */}
              <div className="space-y-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTasks(project);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                  style={{
                    background: "linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 50%, #8B3F8B 100%)",
                    color: "#F4E4BC",
                    border: "2px solid #D4AF37",
                    boxShadow: "inset 0 1px 0 #D4AF3740, 0 4px 8px #00000060, 0 0 20px #8B3F8B40",
                    textShadow: "0 1px 2px #00000080"
                  }}
                >
                  <Eye size={16} />
                  View Task Details
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                    style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProject(project);
                  }}
                  className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)",
                    color: "#D4AF37",
                    border: "2px solid #8B3F8B",
                    boxShadow: "inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040"
                  }}
                >
                  <Edit size={16} />
                  Edit Project
                </button>
              <button
                  className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)",
                    color: "#D4AF37",
                    border: "2px solid #8B3F8B",
                    boxShadow: "inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040"
                  }}
                  onClick={(e) =>{
                        e.stopPropagation();
                        console.log('Project object:', project);
                        console.log('Project type:', typeof project);
                        console.log('Project keys:', Object.keys(project));
                        onSaveProject(project)}}>Save Changes</button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for 3D flip effect */}
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
        
        /* Custom scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(139, 105, 20, 0.1);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.6);
        }
      `}</style>
    </div>
  );
}