import { ArrowLeft, Calendar, User, Tag, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  priority: "high" | "medium" | "low";
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
  tasks: Task[];
}

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

const statusConfig = {
  completed: {
    color: "#10B981", // emerald-500
    label: "Completed",
    icon: CheckCircle,
  },
  "in-progress": {
    color: "#F59E0B", // amber-500
    label: "In Progress",
    icon: Clock,
  },
  pending: {
    color: "#94A3B8", // slate-400
    label: "Pending",
    icon: AlertCircle,
  },
};

const priorityConfig = {
  high: { color: "#F87171", label: "High" }, // red-400
  medium: { color: "#F59E0B", label: "Medium" }, // amber-500
  low: { color: "#10B981", label: "Low" }, // emerald-500
};

function TaskCard({ task }: { task: Task }) {
  const statusInfo = statusConfig[task.status];
  const priorityInfo = priorityConfig[task.priority];
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      className="p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        backgroundColor: '#334155', // slate-700
        borderColor: '#475569', // slate-600
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 
            className="mb-1"
            style={{ color: '#F1F5F9' }} // slate-100
          >
            {task.title}
          </h4>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: '#94A3B8' }} // slate-400
          >
            {task.description}
          </p>
        </div>
        
        {/* Priority Badge */}
        <div 
          className="px-2 py-1 rounded text-xs ml-3"
          style={{ 
            backgroundColor: `${priorityInfo.color}20`,
            color: priorityInfo.color,
            border: `1px solid ${priorityInfo.color}40`
          }}
        >
          {priorityInfo.label}
        </div>
      </div>

      {/* Status and Details */}
      <div className="flex items-center justify-between mb-3">
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{ 
            backgroundColor: `${statusInfo.color}20`,
            color: statusInfo.color,
            border: `1px solid ${statusInfo.color}40`
          }}
        >
          <StatusIcon size={12} />
          {statusInfo.label}
        </div>

        <div className="flex items-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            {task.dueDate}
          </div>
          <div className="flex items-center gap-1">
            <User size={12} />
            {task.assignee}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {task.tags.map((tag, index) => (
          <div 
            key={index}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{ 
              backgroundColor: '#475569', // slate-600
              color: '#94A3B8' // slate-400
            }}
          >
            <Tag size={10} />
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
  const projectStatusConfig = {
    safe: { color: "#10B981", label: "On Track" },
    caution: { color: "#F59E0B", label: "At Risk" },
    risk: { color: "#F87171", label: "Critical" },
  };

  const statusInfo = projectStatusConfig[project.status];

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: '#1E293B' }} // slate-800
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: '#334155',
              color: '#94A3B8',
              border: '1px solid #475569'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 
                className="text-3xl"
                style={{ color: '#F1F5F9' }} // slate-100
              >
                {project.name}
              </h1>
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${statusInfo.color}20`,
                  color: statusInfo.color,
                  border: `1px solid ${statusInfo.color}40`
                }}
              >
                {statusInfo.label}
              </div>
            </div>
            <p 
              className="text-lg mb-4"
              style={{ color: '#94A3B8' }} // slate-400
            >
              {project.description}
            </p>
            
            {/* Project Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span style={{ color: '#94A3B8' }}>Progress: </span>
                <span style={{ color: '#F1F5F9' }}>{project.progress}%</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Due Date: </span>
                <span style={{ color: '#F1F5F9' }}>{project.dueDate}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Team: </span>
                <span style={{ color: '#F1F5F9' }}>{project.teamSize} members</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Tasks: </span>
                <span style={{ color: '#F1F5F9' }}>{project.tasksCompleted}/{project.totalTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl">
          <div 
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: '#475569' }} // slate-600
          >
            <div 
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: statusInfo.color
              }}
            />
          </div>
        </div>
      </header>

      {/* Tasks Grid */}
      <main className="max-w-7xl mx-auto">
        <h2 
          className="text-xl mb-6"
          style={{ color: '#F1F5F9' }} // slate-100
        >
          Project Tasks ({project.tasks.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </main>
    </div>
  );
}