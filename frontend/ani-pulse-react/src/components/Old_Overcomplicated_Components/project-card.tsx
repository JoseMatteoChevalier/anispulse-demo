import { useState } from "react";
import { Calendar, Users, Activity, AlertTriangle, RotateCcw, Eye, Edit, CheckCircle, AlertCircle } from "lucide-react";

interface Subtask {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
  dueDate: string;
  assignee: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "safe" | "caution" | "risk";
  progress: number;
  dueDate: string;
  teamSize: number;
  tasksCompleted: number;
  totalTasks: number;
  subtasks: Subtask[];
  tasks: Task[];
  project_name?: string;
  start_date?: string;
}

interface ProjectCardProps {
  project: Project;
  projects: any[]
  onCreateProject: (formData: any) => void;
  onViewProject: (project: Project) => void;
  onViewSubtasks: (project: Project) => void;
  onEditProject: (project: Project) => void; // Changed from onSaveProject
}

const statusConfig = {
  safe: {
    color: "#32CD32",
    label: "Blessed Path",
    icon: Activity,
    glow: "#32CD3240"
  },
  caution: {
    color: "#FFD700",
    label: "Perilous Winds",
    icon: AlertTriangle,
    glow: "#FFD70040"
  },
  risk: {
    color: "#DC143C",
    label: "Doomed Fate",
    icon: AlertTriangle,
    glow: "#DC143C40"
  },
  'safe': { icon: CheckCircle, glow: '#4CAF5040' },
  'warning': { icon: AlertTriangle, glow: '#F59E0B40' },
  'danger': { icon: AlertCircle, glow: '#F4433640' }
};

const subtaskStatusConfig = {
  completed: { color: "#32CD32", label: "Fulfilled", glow: "#32CD3230" },
  "in-progress": { color: "#FFD700", label: "Weaving", glow: "#FFD70030" },
  pending: { color: "#C9A876", label: "Awaiting", glow: "#C9A87630" },
};

export function ProjectCard({ project, onViewProject, onViewSubtasks, onEditProject }: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);



  const defaultStatus = project.status || "caution";
  const statusInfo = statusConfig[defaultStatus];
  const StatusIcon = statusInfo?.icon || Activity; // fallback icon

 const glowStyle = {
  boxShadow: (statusInfo && statusInfo.glow) ? `0 0 15px ${statusInfo.glow}` : '0 0 5px rgba(139, 105, 20, 0.3)'
};

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="group relative h-[420px] perspective-1000">
      {/* Tarot Card Container with 3D flip */}
      <div
        className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side - Tarot Card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          onClick={handleFlip}
          style={{ cursor: 'pointer' }}
        >
          {/* Ornate Card Frame */}
          <div
            className="relative h-full border-4 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)',
              borderImage: 'linear-gradient(135deg, #D4AF37, #CD853F, #B8860B, #CD853F, #D4AF37) 1',
              borderColor: '#D4AF37',
              boxShadow: `
                inset 0 1px 0 #D4AF3740,
                inset 0 -1px 0 #8B691480,
                0 4px 8px #00000060,
                0 0 20px ${statusInfo.glow}
              `
            }}
          >
            {/* Ornate Corner Decorations */}
            <div
              className="absolute top-2 left-2 w-8 h-8 opacity-60"
              style={{
                background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }}
            />
            <div
              className="absolute top-2 right-2 w-8 h-8 opacity-60"
              style={{
                background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }}
            />
            <div
              className="absolute bottom-2 left-2 w-8 h-8 opacity-60"
              style={{
                background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }}
            />
            <div
              className="absolute bottom-2 right-2 w-8 h-8 opacity-60"
              style={{
                background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }}
            />

            {/* Mystical Hover overlay */}
            <div
              className="absolute inset-2 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded"
              style={{
                background: `radial-gradient(circle, ${statusInfo.color} 0%, transparent 70%)`,
              }}
            />

            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col p-6">
              {/* Mystical Header */}
              <div className="text-center mb-6">
                <h3
                  className="text-xl mb-3 relative"
                  style={{
                    color: '#F4E4BC',
                    textShadow: '0 0 8px #D4AF3750, 0 2px 4px #00000080',
                    fontFamily: 'serif'
                  }}
                >
                  {project.name}
                  {/* Mystical underline */}
                  <div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-px"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)'
                    }}
                  />
                </h3>

                {/* Status Emblem */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs relative mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${statusInfo.color}15, ${statusInfo.color}25)`,
                    color: statusInfo.color,
                    border: `2px solid ${statusInfo.color}60`,
                    boxShadow: `0 0 10px ${statusInfo.glow}, inset 0 1px 0 ${statusInfo.color}20`,
                    textShadow: '0 1px 2px #00000080'
                  }}
                >
                  <StatusIcon size={14} />
                  {statusInfo.label}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle, ${statusInfo.color} 0%, transparent 70%)` }}
                  />
                </div>

                <p
                  className="text-sm leading-relaxed italic opacity-80"
                  style={{ color: '#C9A876' }}
                >
                  {project.description}
                </p>
              </div>

              {/* Mystical Progress Orb */}
              <div className="mb-6 text-center">
                <div className="flex justify-between items-center mb-3">
                  <span
                    className="text-sm"
                    style={{ color: '#C9A876' }}
                  >
                    Quest Progress
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: '#F4E4BC',
                      textShadow: '0 1px 2px #00000060'
                    }}
                  >
                    {project.progress}%
                  </span>
                </div>

                {/* Ornate Progress Bar */}
                <div className="relative">
                  <div
                    className="h-3 rounded-full overflow-hidden border-2"
                    style={{
                      backgroundColor: '#2D1F1F',
                      borderColor: '#8B6914',
                      boxShadow: 'inset 0 1px 2px #00000060'
                    }}
                  >
                    <div
                      className="h-full transition-all duration-500 ease-out relative"
                      style={{
                        width: `${project.progress}%`,
                        background: `linear-gradient(90deg, ${statusInfo.color}80, ${statusInfo.color}, ${statusInfo.color}80)`,
                        boxShadow: `0 0 6px ${statusInfo.glow}`
                      }}
                    >
                      {/* Progress glow effect */}
                      <div
                        className="absolute inset-0 opacity-60"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, ${statusInfo.color} 50%, transparent 100%)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Decorative ends */}
                  <div
                    className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 4px #D4AF3760' }}
                  />
                  <div
                    className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 4px #D4AF3760' }}
                  />
                </div>
              </div>

              {/* Mystical Stats */}
              <div className="space-y-4 pt-4 border-t mt-auto" style={{ borderColor: '#8B6914' }}>
                {/* Due Date Rune */}
                <div
                  className="flex items-center gap-3 p-2 rounded"
                  style={{
                    background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A, #2D1F1F)',
                    border: '1px solid #8B691440'
                  }}
                >
                  <Calendar size={16} style={{ color: '#D4AF37' }} />
                  <div className="flex-1">
                    <p
                      className="text-xs"
                      style={{ color: '#C9A876' }}
                    >
                      Destined Date
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: '#F4E4BC',
                        textShadow: '0 1px 2px #00000060'
                      }}
                    >
                      {project.dueDate}
                    </p>
                  </div>
                </div>

                {/* Team Coven */}
                <div
                  className="flex items-center gap-3 py-0.5 px-1 rounded"
                  style={{
                    background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A, #2D1F1F)',
                    border: '1px solid #8B691440'
                  }}
                >
                  <Users size={15} style={{ color: '#8B3F8B' }} />
                  <div className="flex-1">
                    <p
                      className="text-xs"
                      style={{ color: '#C9A876' }}
                    >
                      Coven Size
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: '#F4E4BC',
                        textShadow: '0 1px 2px #00000060'
                      }}
                    >
                      {project.teamSize} mystics
                    </p>
                  </div>
                </div>

                {/* Quest Tasks */}
                <div
                  className="flex items-center gap-3 p-2 rounded"
                  style={{
                    background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A, #2D1F1F)',
                    border: '1px solid #8B691440'
                  }}
                >
                  <Activity size={16} style={{ color: statusInfo.color }} />
                  <div className="flex-1">
                    <p
                      className="text-xs"
                      style={{ color: '#C9A876' }}
                    >
                      Rituals
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: '#F4E4BC',
                        textShadow: '0 1px 2px #00000060'
                      }}
                    >
                      {project.tasksCompleted}/{project.totalTasks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mystical Flip Rune */}
              <div
                className="absolute bottom-4 right-4 opacity-60 transition-all duration-200 group-hover:opacity-100 group-hover:scale-110"
                style={{ color: '#D4AF37' }}
              >
                <div className="relative">
                  <RotateCcw size={18} />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                    style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Mystical Scroll */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg overflow-hidden"
        >
          <div
            className="relative h-full border-4 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)',
              borderImage: 'linear-gradient(135deg, #CD853F, #D4AF37, #B8860B, #D4AF37, #CD853F) 1',
              borderColor: '#CD853F',
              boxShadow: `
                inset 0 1px 0 #D4AF3740,
                inset 0 -1px 0 #8B691480,
                0 4px 8px #00000060,
                0 0 15px #CD853F40
              `
            }}
          >
            {/* Arcane Corner Decorations */}
            <div
              className="absolute top-2 left-2 w-6 h-6 opacity-50"
              style={{
                background: 'radial-gradient(circle, #CD853F 0%, transparent 70%)',
                clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)'
              }}
            />
            <div
              className="absolute top-2 right-2 w-6 h-6 opacity-50"
              style={{
                background: 'radial-gradient(circle, #CD853F 0%, transparent 70%)',
                clipPath: 'polygon(100% 0%, 100% 100%, 0% 0%)'
              }}
            />
            <div
              className="absolute bottom-2 left-2 w-6 h-6 opacity-50"
              style={{
                background: 'radial-gradient(circle, #CD853F 0%, transparent 70%)',
                clipPath: 'polygon(0% 100%, 100% 100%, 0% 0%)'
              }}
            />
            <div
              className="absolute bottom-2 right-2 w-6 h-6 opacity-50"
              style={{
                background: 'radial-gradient(circle, #CD853F 0%, transparent 70%)',
                clipPath: 'polygon(100% 100%, 0% 100%, 100% 0%)'
              }}
            />

            {/* Mystical Back Content */}
            <div className="relative z-10 h-full flex flex-col p-6">
              {/* Arcane Header */}
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-xl text-center flex-1"
                  style={{
                    color: '#F4E4BC',
                    textShadow: '0 0 8px #CD853F50, 0 2px 4px #00000080',
                    fontFamily: 'serif'
                  }}
                >
                  Sacred Subtasks
                  <div
                    className="w-12 h-px mx-auto mt-2"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)'
                    }}
                  />
                </h3>
                <button
                  onClick={handleFlip}
                  className="p-2 rounded transition-all duration-200 hover:scale-110 ml-4"
                  style={{
                    color: '#D4AF37',
                    background: 'linear-gradient(135deg, #2D1F1F, #3D2A2A)',
                    border: '1px solid #8B6914'
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Mystical Subtasks Scroll Attempt to loop through tasks 09/17 */}
              {/*<div className="flex-1 space-y-3 mb-6 overflow-y-auto">*/}
              {/*  {project.subtasks.map((subtask) => {*/}
              {/*    const subtaskStatus = subtaskStatusConfig[subtask.status];*/}
              {/*    return (*/}
              {/*      <div*/}
              {/*        key={subtask.id}*/}
              {/*        className="p-3 rounded border relative"*/}
              {/*        style={{*/}
              {/*          background: 'linear-gradient(135deg, #3D2A2A 0%, #4A3131 50%, #3D2A2A 100%)',*/}
              {/*          borderColor: '#8B6914',*/}
              {/*          boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'*/}
              {/*        }}*/}
              {/*      >*/}
              {/*        <div className="flex items-center justify-between mb-2">*/}
              {/*          <span*/}
              {/*            className="text-sm"*/}
              {/*            style={{*/}
              {/*              color: '#F4E4BC',*/}
              {/*              textShadow: '0 1px 2px #00000060'*/}
              {/*            }}*/}
              {/*          >*/}
              {/*            {subtask.name}*/}
              {/*          </span>*/}
              {/*          <div*/}
              {/*            className="px-3 py-1 rounded-full text-xs relative"*/}
              {/*            style={{*/}
              {/*              background: `linear-gradient(135deg, ${subtaskStatus.color}15, ${subtaskStatus.color}25)`,*/}
              {/*              color: subtaskStatus.color,*/}
              {/*              border: `1px solid ${subtaskStatus.color}60`,*/}
              {/*              boxShadow: `0 0 6px ${subtaskStatus.glow}`,*/}
              {/*              textShadow: '0 1px 2px #00000080'*/}
              {/*            }}*/}
              {/*          >*/}
              {/*            {subtaskStatus.label}*/}
              {/*          </div>*/}
              {/*        </div>*/}
              {/*        <div className="flex items-center justify-between text-xs">*/}
              {/*          <span style={{ color: '#C9A876' }}>{subtask.assignee}</span>*/}
              {/*          <span style={{ color: '#C9A876' }}>{subtask.dueDate}</span>*/}
              {/*        </div>*/}

              {/*        /!* Subtle inner glow *!/*/}
              {/*        <div*/}
              {/*          className="absolute inset-0 rounded opacity-20 pointer-events-none"*/}
              {/*          style={{*/}
              {/*            background: `radial-gradient(circle at center, ${subtaskStatus.color}10 0%, transparent 70%)`*/}
              {/*          }}*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    );*/}
              {/*  })}*/}
              {/*</div>*/}


                {/* --- NEW TASKS BLOCK --- */}
<div className="flex-1 space-y-3 mb-6 overflow-y-auto">
  {project.tasks.map((task) => {
    return (
      <div
        key={task.id}
        className="p-3 rounded border relative"
        style={{
          background: 'linear-gradient(135deg, #3D2A2A 0%, #4A3131 50%, #3D2A2A 100%)',
          borderColor: '#8B6914',
          boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-sm"
            style={{
              color: '#F4E4BC',
              textShadow: '0 1px 2px #00000060'
            }}
          >
            {task.title}
          </span>
          <div
            className="px-3 py-1 rounded-full text-xs relative"
            style={{
              background: 'linear-gradient(135deg, #C9A87615, #C9A87625)',
              color: '#C9A876',
              border: '1px solid #C9A87660',
              textShadow: '0 1px 2px #00000080'
            }}
          >
            {task.status}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: '#C9A876' }}>{task.assignee}</span>
          <span style={{ color: '#C9A876' }}>{task.dueDate}</span>
        </div>
      </div>
    );
  })}
</div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSubtasks(project);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                  style={{
                    background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 50%, #8B3F8B 100%)',
                    color: '#F4E4BC',
                    border: '2px solid #D4AF37',
                    boxShadow: 'inset 0 1px 0 #D4AF3740, 0 4px 8px #00000060, 0 0 20px #8B3F8B40',
                    textShadow: '0 1px 2px #00000080'
                  }}
                >
                  <Eye size={16} />
                  Unveil Sacred Path
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                    style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProject(project); // Changed to call parent handler
                  }}
                  className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                    color: '#D4AF37',
                    border: '2px solid #8B3F8B',
                    boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
                  }}
                >
                  <Edit size={16} />
                  Edit Quest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/*<div>*/}
    {/*  {showNewForm && (*/}
    {/*    <NewProjectForm*/}
    {/*      onBack={() => setShowNewForm(false)}*/}
    {/*      onSubmit={onCreateProject}  // ← Connect here*/}
    {/*    />*/}


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
      `}</style>
    </div>
  );
}