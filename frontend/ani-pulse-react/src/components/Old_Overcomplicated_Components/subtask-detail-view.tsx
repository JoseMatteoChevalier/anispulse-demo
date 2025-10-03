// // New Revision with attempts from ChatGPT?
//
// import { ArrowLeft, Calendar, User, Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";
// import { useState } from "react"
// import { BarChart3 } from "lucide-react"
// import { RiskAnalytics } from "./RiskAnalytics" // Adjust path
//
// // --- OLD SUBTASK INTERFACE (commented for history) ---
// // interface Subtask {
// //   id: string;
// //   name: string;
// //   status: "completed" | "in-progress" | "pending";
// //   progress: number;
// //   dueDate: string;
// //   assignee: string;
// //   predecessors?: string[];
// //   is_critical?: boolean;
// // }
//
// interface Task {
//   id: string;
//   title: string;
//   description: string;
//   status: string;
//   priority: string;
//   dueDate: string;
//   assignee: string;
//   tags: string[];
//   predecessors?: string[];
//   is_critical?: boolean;
// }
//
// interface Project {
//   id: string;
//   name: string;
//   description: string;
//   status: "safe" | "caution" | "risk" | "danger" | "warning";
//   progress: number;
//   dueDate: string;
//   teamSize: number;
//   tasksCompleted: number;
//   totalTasks: number;
//   // subtasks: Subtask[];   // ❌ old
//   tasks: Task[];            // ✅ new
// }
//
// interface TaskDetailViewProps {
//   project: Project;
//   onBack: () => void;
// }
//
// const statusConfig = {
//   completed: { color: "#32CD32", label: "Fulfilled", icon: CheckCircle, glow: "#32CD3240" },
//   "in-progress": { color: "#FFD700", label: "Weaving", icon: Clock, glow: "#FFD70040" },
//   pending: { color: "#C9A876", label: "Awaiting", icon: AlertCircle, glow: "#C9A87640" },
// };
//
// function calculateTaskLevels(tasks: Task[]) {
//   const levels: { [key: string]: number } = {};
//   const visited = new Set<string>();
//
//   function getLevel(taskId: string): number {
//     if (visited.has(taskId)) return levels[taskId];
//     const task = tasks.find(t => t.id === taskId);
//     if (!task || !task.predecessors || task.predecessors.length === 0) {
//       levels[taskId] = 0;
//     } else {
//       const predecessorLevels = task.predecessors.map(predId => getLevel(predId));
//       levels[taskId] = Math.max(...predecessorLevels) + 1;
//     }
//     visited.add(taskId);
//     return levels[taskId];
//   }
//
//   tasks.forEach(task => getLevel(task.id));
//   return levels;
// }
//
// function groupTasksByLevel(tasks: Task[], taskLevels: { [key: string]: number }) {
//   const groups: { [key: number]: (Task & { originalIndex: number })[] } = {};
//   tasks.forEach((task, originalIndex) => {
//     const level = taskLevels[task.id] || 0;
//     if (!groups[level]) groups[level] = [];
//     groups[level].push({ ...task, originalIndex });
//   });
//   return groups;
// }
//
// function calculateYPositions(tasksInLevel: any[], cardHeight = 280) {
//   return tasksInLevel.map((_, index) => index * cardHeight);
// }
//
// function TaskCard({
//   task,
//   index,
//   isCritical = false,
//   isFirstLevel = false,
//   isLastLevel = false,
//   onUpdate
// }: {
//   task: Task;
//   index: number;
//   isCritical?: boolean;
//   isFirstLevel?: boolean;
//   isLastLevel?: boolean;
//   onUpdate?: (taskId: string, updates: Partial<Task>) => void;
// }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const statusInfo = statusConfig[task.status as keyof typeof statusConfig];
//   const StatusIcon = statusInfo?.icon || AlertCircle;
//
//   if (isEditing) {
//     return (
//       <TaskEditForm
//         task={task}
//         onSave={(updates) => {
//           onUpdate?.(task.id, updates);
//           setIsEditing(false);
//         }}
//         onCancel={() => setIsEditing(false)}
//       />
//     );
//   }
//
//   return (
//     <div className="relative rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
//       <div className="relative z-10 p-6">
//         <h4 className="text-xl mb-3" style={{ color: '#F4E4BC' }}>
//           {task.title}
//         </h4>
//         <p style={{ color: '#C9A876' }}>{task.description}</p>
//         <div className="text-sm mt-4">
//           <span style={{ color: '#C9A876' }}>Assigned to: {task.assignee}</span><br />
//           <span style={{ color: '#C9A876' }}>Due: {task.dueDate}</span>
//         </div>
//         <button
//           onClick={() => setIsEditing(true)}
//           className="w-full mt-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
//           style={{ background: 'linear-gradient(135deg, #4A1A4A, #6B2C6B)', color: '#D4AF37' }}
//         >
//           Edit Task
//         </button>
//       </div>
//     </div>
//   );
// }
//
// function TaskEditForm({ task, onSave, onCancel }: {
//   task: Task;
//   onSave: (updates: Partial<Task>) => void;
//   onCancel: () => void;
// }) {
//   const [title, setTitle] = useState(task.title);
//   const [status, setStatus] = useState(task.status);
//
//   return (
//     <div className="p-6 rounded-lg border-2" style={{ background: '#2D1F1F', borderColor: '#8B6914' }}>
//       <h4 style={{ color: '#F4E4BC' }}>Edit Task</h4>
//       <input value={title} onChange={(e) => setTitle(e.target.value)} />
//       <select value={status} onChange={(e) => setStatus(e.target.value)}>
//         <option value="pending">Pending</option>
//         <option value="in-progress">In Progress</option>
//         <option value="completed">Completed</option>
//       </select>
//       <div className="flex gap-2 mt-4">
//         <button onClick={() => onSave({ title, status })}>Save</button>
//         <button onClick={onCancel}>Cancel</button>
//       </div>
//     </div>
//   );
// }
//
// function SkillTreeLayout({ project, onTaskUpdate }: {
//   project: Project;
//   onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
// }) {
//   const taskLevels = calculateTaskLevels(project.tasks);
//   const levelGroups = groupTasksByLevel(project.tasks, taskLevels);
//   const maxLevel = Object.keys(levelGroups).length > 0 ? Math.max(...Object.keys(levelGroups).map(Number)) : 0;
//
//   return (
//     <div className="relative overflow-x-auto p-8">
//       <div style={{ width: `${(maxLevel + 1) * 320}px` }}>
//         {Object.entries(levelGroups).map(([level, tasksInLevel]) => {
//           const levelNum = Number(level);
//           const yPositions = calculateYPositions(tasksInLevel);
//           return tasksInLevel.map((task, idx) => (
//             <div key={task.id} style={{ left: `${levelNum * 320}px`, top: `${yPositions[idx]}px`, position: 'absolute' }}>
//               <TaskCard task={task} index={task.originalIndex} onUpdate={onTaskUpdate} />
//             </div>
//           ));
//         })}
//       </div>
//     </div>
//   );
// }
//
// export function TaskDetailView({ project, onBack }: TaskDetailViewProps) {
//   const [currentProject, setCurrentProject] = useState(project);
//
//   const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
//     const updatedProject = {
//       ...currentProject,
//       tasks: currentProject.tasks.map(task =>
//         task.id === taskId ? { ...task, ...updates } : task
//       )
//     };
//     setCurrentProject(updatedProject);
//   };
//
//   return (
//     <div>
//       <button onClick={onBack}>Back</button>
//       <h1>{currentProject.name} - Tasks</h1>
//       <SkillTreeLayout project={currentProject} onTaskUpdate={handleTaskUpdate} />
//     </div>
//   );
// }
//
// export { TaskDetailView as SubtaskDetailView };

// Begin the old version we worked on with Claude

import { ArrowLeft, Calendar, User, Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react"
import { BarChart3 } from "lucide-react"
//import RiskAnalyticsTest from './components/RiskAnalyticsTest';
import { RiskAnalytics } from "../RiskAnalytics" // Adjust path

interface Subtask {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
  dueDate: string;
  assignee: string;
  // Foundation Engine fields
  predecessors?: string[];
  is_critical?: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "safe" | "caution" | "risk" | "danger" | "warning"; // Added missing statuses
  progress: number;
  dueDate: string;
  teamSize: number;
  tasksCompleted: number;
  totalTasks: number;
  subtasks: Subtask[];
}

interface SubtaskDetailViewProps {
  project: Project;
  onBack: () => void;
}

const statusConfig = {
  completed: {
    color: "#32CD32",
    label: "Fulfilled",
    icon: CheckCircle,
    glow: "#32CD3240"
  },
  "in-progress": {
    color: "#FFD700",
    label: "Weaving",
    icon: Clock,
    glow: "#FFD70040"
  },
  pending: {
    color: "#C9A876",
    label: "Awaiting",
    icon: AlertCircle,
    glow: "#C9A87640"
  },
};

/**
 * Calculate dependency levels for task positioning
 */
function calculateTaskLevels(tasks: Subtask[]) {
  const levels: { [key: string]: number } = {};
  const visited = new Set<string>();

  function getLevel(taskId: string): number {
    if (visited.has(taskId)) return levels[taskId];

    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.predecessors || task.predecessors.length === 0) {
      levels[taskId] = 0; // No dependencies = leftmost
    } else {
      const predecessorLevels = task.predecessors.map(predId => getLevel(predId));
      levels[taskId] = Math.max(...predecessorLevels) + 1;
    }

    visited.add(taskId);
    return levels[taskId];
  }

  tasks.forEach(task => getLevel(task.id));
  return levels;
}

/**
 * Group tasks by their dependency level
 */
function groupTasksByLevel(tasks: Subtask[], taskLevels: { [key: string]: number }) {
  const groups: { [key: number]: (Subtask & { originalIndex: number })[] } = {};

  tasks.forEach((task, originalIndex) => {
    const level = taskLevels[task.id] || 0;
    if (!groups[level]) groups[level] = [];
    groups[level].push({ ...task, originalIndex });
  });

  return groups;
}

/**
 * Calculate optimal Y positions to minimize overlaps
 */
function calculateYPositions(tasksInLevel: any[], cardHeight = 280) {
  return tasksInLevel.map((_, index) => index * cardHeight);
}

function SubtaskCard({
  subtask,
  index,
  isCritical = false,
  isFirstLevel = false,
  isLastLevel = false,
  onUpdate
}: {
  subtask: Subtask;
  index: number;
  isCritical?: boolean;
  isFirstLevel?: boolean;
  isLastLevel?: boolean;
  onUpdate?: (taskId: string, updates: Partial<Subtask>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const statusInfo = statusConfig[subtask.status];
  const StatusIcon = statusInfo?.icon || AlertCircle;

  if (isEditing) {
    return (
      <SubtaskEditForm
        subtask={subtask}
        onSave={(updates) => {
          onUpdate?.(subtask.id, updates);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const criticalGlow = isCritical ? {
    boxShadow: `
      inset 0 1px 0 #D4AF3720,
      inset 0 -1px 0 #8B691480,
      0 4px 8px #00000060,
      0 0 15px ${statusInfo?.glow || '#8B691440'},
      0 0 25px #FF000040
    `,
    borderColor: '#FF4444'
  } : {
    boxShadow: `
      inset 0 1px 0 #D4AF3720,
      inset 0 -1px 0 #8B691480,
      0 4px 8px #00000060,
      0 0 15px ${statusInfo?.glow || '#8B691440'}
    `,
    borderColor: '#8B6914'
  };

  return (
    <div
      className="relative rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
      style={{
        background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)',
        ...criticalGlow
      }}
    >
      {/* Critical path indicator */}
      {isCritical && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs z-30"
          style={{
            background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)',
            borderColor: '#FFFFFF',
            color: '#FFFFFF',
            boxShadow: '0 0 10px #FF444460',
            fontSize: '10px'
          }}
        >
          🔥
        </div>
      )}

      {/* Positioning indicators */}
      <div className="absolute bottom-2 right-2 text-xs opacity-50" style={{ color: '#8B6914' }}>
        {isFirstLevel && "Start"}
        {isLastLevel && "End"}
      </div>

      {/* Ornate corners */}
      <div
        className="absolute top-1 left-1 w-4 h-4 opacity-40"
        style={{
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)'
        }}
      />
      <div
        className="absolute top-1 right-1 w-4 h-4 opacity-40"
        style={{
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          clipPath: 'polygon(100% 0%, 100% 100%, 0% 0%)'
        }}
      />
      <div
        className="absolute bottom-1 left-1 w-4 h-4 opacity-40"
        style={{
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          clipPath: 'polygon(0% 100%, 100% 100%, 0% 0%)'
        }}
      />
      <div
        className="absolute bottom-1 right-1 w-4 h-4 opacity-40"
        style={{
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          clipPath: 'polygon(100% 100%, 0% 100%, 100% 0%)'
        }}
      />

      {/* Step Number */}
      <div
        className="absolute -top-3 -left-3 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm z-20"
        style={{
          background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
          borderColor: '#D4AF37',
          color: '#F4E4BC',
          boxShadow: '0 0 10px #8B3F8B40',
          textShadow: '0 1px 2px #00000080'
        }}
      >
        {index + 1}
      </div>

      <div className="relative z-10 p-6">
        {/* Mystical Header */}
        <div className="text-center mb-6">
          <h4
            className="text-xl mb-3"
            style={{
              color: '#F4E4BC',
              textShadow: '0 0 8px #D4AF3750, 0 2px 4px #00000080',
              fontFamily: 'serif'
            }}
          >
            {subtask.name}
          </h4>
          <div
            className="w-16 h-px mx-auto mb-4"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)'
            }}
          />

          {/* Status Emblem */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm relative mb-4"
            style={{
              background: `linear-gradient(135deg, ${statusInfo?.color || '#8B6914'}15, ${statusInfo?.color || '#8B6914'}25)`,
              color: statusInfo?.color || '#8B6914',
              border: `2px solid ${statusInfo?.color || '#8B6914'}60`,
              boxShadow: `0 0 12px ${statusInfo?.glow || '#8B691440'}, inset 0 1px 0 ${statusInfo?.color || '#8B6914'}20`,
              textShadow: '0 1px 2px #00000080'
            }}
          >
            <StatusIcon size={16} />
            {statusInfo?.label || 'Unknown'}
          </div>
        </div>

        {/* Mystical Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span
              className="text-sm"
              style={{ color: '#C9A876' }}
            >
              Sacred Progress
            </span>
            <span
              className="text-sm"
              style={{
                color: '#F4E4BC',
                textShadow: '0 1px 2px #00000060'
              }}
            >
              {subtask.progress}%
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
                  width: `${subtask.progress}%`,
                  background: `linear-gradient(90deg, ${statusInfo?.color || '#8B6914'}80, ${statusInfo?.color || '#8B6914'}, ${statusInfo?.color || '#8B6914'}80)`,
                  boxShadow: `0 0 6px ${statusInfo?.glow || '#8B691440'}`
                }}
              >
                {/* Progress glow effect */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${statusInfo?.color || '#8B6914'} 50%, transparent 100%)`
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

        {/* Mystic Details */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div
            className="flex items-center gap-2 p-3 rounded"
            style={{
              background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A)',
              border: '1px solid #8B691440'
            }}
          >
            <Calendar size={16} style={{ color: '#D4AF37' }} />
            <div>
              <p style={{ color: '#C9A876' }}>Destined Date</p>
              <p style={{
                color: '#F4E4BC',
                textShadow: '0 1px 2px #00000060'
              }}>{subtask.dueDate}</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 p-3 rounded"
            style={{
              background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A)',
              border: '1px solid #8B691440'
            }}
          >
            <User size={16} style={{ color: '#8B3F8B' }} />
            <div>
              <p style={{ color: '#C9A876' }}>Mystic</p>
              <p style={{
                color: '#F4E4BC',
                textShadow: '0 1px 2px #00000060'
              }}>{subtask.assignee}</p>
            </div>
          </div>
        </div>

        {/* ADD EDIT BUTTON HERE */}
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
            color: '#D4AF37',
            border: '2px solid #8B3F8B',
            boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
          }}
        >
          Edit Task
        </button>

        {/* Mystical hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${statusInfo?.color || '#8B6914'} 0%, transparent 70%)`
          }}
        />
      </div>
    </div>
  );
}

function SkillTreeLayout({ project, onSubtaskUpdate }: {
  project: Project;
  onSubtaskUpdate: (taskId: string, updates: Partial<Subtask>) => void;
}) {
  const taskLevels = calculateTaskLevels(project.subtasks);
  const levelGroups = groupTasksByLevel(project.subtasks, taskLevels);
  const maxLevel = Object.keys(levelGroups).length > 0 ? Math.max(...Object.keys(levelGroups).map(Number)) : 0;

  console.log('Subtasks data:', project.subtasks);
  console.log('Task levels:', taskLevels);

  // Calculate container dimensions
  const containerWidth = (maxLevel + 1) * 320; // 320px per level (card + spacing)
  const maxTasksInLevel = Object.keys(levelGroups).length > 0 ? Math.max(...Object.values(levelGroups).map(group => group.length)) : 1;
  const containerHeight = Math.max(600, maxTasksInLevel * 280);

  return (
    <div
      className="relative overflow-x-auto overflow-y-visible p-8 mx-auto"
      style={{
        width: '100%',
        minHeight: `${containerHeight}px`
      }}
    >
      {/* Scrollable container for wide skill trees */}
      <div
        className="relative"
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          minWidth: '100%'
        }}
      >
        {Object.entries(levelGroups).map(([level, tasksInLevel]) => {
          const levelNum = Number(level);
          const yPositions = calculateYPositions(tasksInLevel);

          return tasksInLevel.map((task, indexInLevel) => {
            const isFirstLevel = levelNum === 0;
            const isLastLevel = levelNum === maxLevel;
            const isCritical = task.is_critical || false;

            return (
              <div
                key={task.id}
                className="absolute transition-all duration-300 hover:z-10"
                style={{
                  left: `${levelNum * 320}px`, // 320px spacing between levels
                  top: `${yPositions[indexInLevel] + 40}px`, // 40px top padding
                  width: '280px', // Fixed card width
                  zIndex: isCritical ? 20 : 10 // Critical path on top
                }}
              >
                {/* Level indicator for debugging */}
                <div
                  className="absolute -top-6 left-0 text-xs px-2 py-1 rounded"
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    fontSize: '10px'
                  }}
                >
                  Level {levelNum}
                </div>

                <SubtaskCard
                  subtask={task}
                  index={task.originalIndex}
                  isFirstLevel={isFirstLevel}
                  isLastLevel={isLastLevel}
                  isCritical={isCritical}
                  onUpdate={onSubtaskUpdate}
                />
              </div>
            );
          });
        })}

        {/* Guide lines for development (can remove later) */}
        {Object.keys(levelGroups).map(level => {
          const levelNum = Number(level);
          return (
            <div
              key={`guide-${level}`}
              className="absolute opacity-10 pointer-events-none"
              style={{
                left: `${levelNum * 320 + 140}px`, // Center of cards
                top: '0px',
                width: '1px',
                height: '100%',
                background: '#D4AF37'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SubtaskEditForm({ subtask, onSave, onCancel }: {
  subtask: Subtask;
  onSave: (updates: Partial<Subtask>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(subtask.name);
  const [status, setStatus] = useState(subtask.status);
  const [progress, setProgress] = useState(subtask.progress);

  return (
    <div className="p-6 rounded-lg border-2" style={{
      background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
      borderColor: '#8B6914'
    }}>
      <h4 className="text-lg mb-4" style={{ color: '#F4E4BC' }}>Edit Task</h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded"
            style={{
              backgroundColor: '#1A0E0E',
              color: '#F4E4BC',
              border: '1px solid #8B6914'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full p-2 rounded"
            style={{
              backgroundColor: '#1A0E0E',
              color: '#F4E4BC',
              border: '1px solid #8B6914'
            }}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>Progress:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="w-full"
          />
          <span style={{ color: '#F4E4BC' }}>{progress}%</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSave({ name, status, progress })}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: '#32CD32',
              color: 'white'
            }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: '#666',
              color: 'white'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubtaskDetailView({ project, onBack }: SubtaskDetailViewProps) {
  const [showRiskAnalytics, setShowRiskAnalytics] = useState(false);
  const [currentProject, setCurrentProject] = useState(project);

  // CONDITIONAL RENDER MUST BE FIRST
  if (showRiskAnalytics) {
    return (
      <RiskAnalytics
        project={currentProject}
        onBack={() => setShowRiskAnalytics(false)}
      />
    );
  }

  const handleSubtaskUpdate = (taskId: string, updates: Partial<Subtask>) => {
    const updatedProject = {
      ...currentProject,
      subtasks: currentProject.subtasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    };
    setCurrentProject(updatedProject);
    console.log('Updating task:', taskId, updates);
  };

  const projectStatusConfig = {
    safe: { color: "#32CD32", label: "Blessed Path", glow: "#32CD3240" },
    caution: { color: "#FFD700", label: "Perilous Winds", glow: "#FFD70040" },
    risk: { color: "#DC143C", label: "Doomed Fate", glow: "#DC143C40" },
    danger: { color: "#F44336", label: "Cursed Fate", glow: "#F4433640" },
    warning: { color: "#F59E0B", label: "Perilous Winds", glow: "#F59E0B40" },
  };

  const statusInfo = projectStatusConfig[currentProject.status] || projectStatusConfig.caution;

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0F0A0A 0%, #1A0E0E 25%, #2D1B1B 50%, #1A0E0E 75%, #0F0A0A 100%)',
      }}
    >
      {/* Arcane Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Mystical energy streams */}
        <div
          className="absolute top-1/4 left-0 w-full h-px opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #CD853F 50%, #D4AF37 80%, transparent 100%)'
          }}
        />
        <div
          className="absolute bottom-1/4 left-0 w-full h-px opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #CD853F 50%, #D4AF37 80%, transparent 100%)'
          }}
        />

        {/* Floating arcane orbs */}
        <div
          className="absolute top-1/3 left-1/5 w-32 h-32 opacity-5 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            animationDuration: '6s'
          }}
        />
        <div
          className="absolute bottom-1/2 right-1/4 w-40 h-40 opacity-5 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, #8B3F8B 0%, transparent 70%)',
            animationDuration: '8s',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Arcane Header */}
      <header className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
            style={{
              background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
              color: '#D4AF37',
              border: '2px solid #8B6914',
              boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
            }}
          >
            <ArrowLeft size={20} />
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"
              style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
            />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1
                className="text-4xl"
                style={{
                  color: '#F4E4BC',
                  textShadow: '0 0 12px #D4AF3750, 0 2px 4px #00000080',
                  fontFamily: 'serif'
                }}
              >
                {currentProject.name} - Task Breakdown
              </h1>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm relative"
                style={{
                  background: `linear-gradient(135deg, ${statusInfo?.color || '#8B6914'}15, ${statusInfo?.color || '#8B6914'}25)`,
                  color: statusInfo?.color || '#8B6914',
                  border: `2px solid ${statusInfo?.color || '#8B6914'}60`,
                  boxShadow: `0 0 12px ${statusInfo?.glow || '#8B691440'}, inset 0 1px 0 ${statusInfo?.color || '#8B6914'}20`,
                  textShadow: '0 1px 2px #00000080'
                }}
              >
                {statusInfo?.label || 'Unknown Status'}
              </div>
            </div>

            {/* Mystical divider */}
            <div
              className="w-32 h-px mb-4"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)'
              }}
            />

            <p
              className="text-xl mb-6 italic"
              style={{
                color: '#C9A876',
                textShadow: '0 1px 2px #00000060'
              }}
            >
              Follow the sacred path through each mystical phase of {currentProject.name.toLowerCase()}
            </p>

            {/* Arcane Quest Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div
                className="p-3 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Quest Progress: </span>
                <span style={{
                  color: '#F4E4BC',
                  textShadow: '0 1px 2px #00000060'
                }}>{currentProject.progress}%</span>
              </div>
              <div
                className="p-3 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Sacred Phases: </span>
                <span style={{
                  color: '#F4E4BC',
                  textShadow: '0 1px 2px #00000060'
                }}>{currentProject.subtasks.length}</span>
              </div>
              <div
                className="p-3 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Destined Date: </span>
                <span style={{
                  color: '#F4E4BC',
                  textShadow: '0 1px 2px #00000060'
                }}>{currentProject.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowRiskAnalytics(true)}
              className="p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
              style={{
                background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                color: '#D4AF37',
                border: '2px solid #8B3F8B',
                boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040, 0 0 15px #8B3F8B40',
              }}
            >
              <BarChart3 size={20} />
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
              />
            </button>
            <span
              className="text-xs text-center"
              style={{ color: '#C9A876' }}
            >
              Risk Analytics
            </span>
          </div>
        </div>

        {/* Mystical Progress Altar */}
        <div className="max-w-7xl relative">
          <div
            className="h-4 rounded-full overflow-hidden border-2 relative"
            style={{
              backgroundColor: '#2D1F1F',
              borderColor: '#8B6914',
              boxShadow: 'inset 0 2px 4px #00000060'
            }}
          >
            <div
              className="h-full transition-all duration-500 ease-out relative"
              style={{
                width: `${currentProject.progress}%`,
                background: `linear-gradient(90deg, ${statusInfo.color}80, ${statusInfo.color}, ${statusInfo.color}80)`,
                boxShadow: `0 0 8px ${statusInfo.glow}`
              }}
            >
              {/* Progress magical effect */}
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${statusInfo.color} 50%, transparent 100%)`
                }}
              />
            </div>
          </div>

          {/* Arcane progress markers */}
          <div
            className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2"
            style={{
              backgroundColor: '#D4AF37',
              borderColor: '#8B6914',
              boxShadow: '0 0 6px #D4AF3760'
            }}
          />
          <div
            className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2"
            style={{
              backgroundColor: '#D4AF37',
              borderColor: '#8B6914',
              boxShadow: '0 0 6px #D4AF3760'
            }}
          />
        </div>
      </header>

      {/* Sacred Subtasks Journey - SKILL TREE LAYOUT */}
      <main className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2
            className="text-2xl mb-2"
            style={{
              color: '#F4E4BC',
              textShadow: '0 0 8px #D4AF3750, 0 2px 4px #00000080',
              fontFamily: 'serif'
            }}
          >
            The Sacred Path ({currentProject.subtasks.length} Phases)
          </h2>
          <div
            className="w-24 h-px mx-auto mb-4"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)'
            }}
          />
          <p
            className="text-sm italic"
            style={{ color: '#C9A876' }}
          >
            Each phase must be completed in the destined order to fulfill the quest
          </p>
        </div>

        {/* Replace grid with skill tree layout */}
        <SkillTreeLayout
          project={currentProject}
          onSubtaskUpdate={handleSubtaskUpdate}
        />
      </main>
    </div>
  );
}