import { ArrowLeft, Calendar, User, Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Subtask {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
  dueDate: string;
  assignee: string;
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

function SubtaskCard({ subtask, index }: { subtask: Subtask; index: number }) {
  const statusInfo = statusConfig[subtask.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      className="relative rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
      style={{
        background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)',
        borderColor: '#8B6914',
        boxShadow: `
          inset 0 1px 0 #D4AF3720,
          inset 0 -1px 0 #8B691480,
          0 4px 8px #00000060,
          0 0 15px ${statusInfo.glow}
        `
      }}
    >
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
              background: `linear-gradient(135deg, ${statusInfo.color}15, ${statusInfo.color}25)`,
              color: statusInfo.color,
              border: `2px solid ${statusInfo.color}60`,
              boxShadow: `0 0 12px ${statusInfo.glow}, inset 0 1px 0 ${statusInfo.color}20`,
              textShadow: '0 1px 2px #00000080'
            }}
          >
            <StatusIcon size={16} />
            {statusInfo.label}
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

        {/* Mystic Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
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
        
        {/* Mystical hover glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${statusInfo.color} 0%, transparent 70%)`
          }}
        />
      </div>
    </div>
  );
}

export function SubtaskDetailView({ project, onBack }: SubtaskDetailViewProps) {
  const projectStatusConfig = {
    safe: { color: "#32CD32", label: "Blessed Path", glow: "#32CD3240" },
    caution: { color: "#FFD700", label: "Perilous Winds", glow: "#FFD70040" },
    risk: { color: "#DC143C", label: "Doomed Fate", glow: "#DC143C40" },
  };

  const statusInfo = projectStatusConfig[project.status];

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
                {project.name} - Sacred Subtasks
              </h1>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm relative"
                style={{ 
                  background: `linear-gradient(135deg, ${statusInfo.color}15, ${statusInfo.color}25)`,
                  color: statusInfo.color,
                  border: `2px solid ${statusInfo.color}60`,
                  boxShadow: `0 0 12px ${statusInfo.glow}, inset 0 1px 0 ${statusInfo.color}20`,
                  textShadow: '0 1px 2px #00000080'
                }}
              >
                {statusInfo.label}
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
              Follow the sacred path through each mystical phase of {project.name.toLowerCase()}
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
                }}>{project.progress}%</span>
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
                }}>{project.subtasks.length}</span>
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
                }}>{project.dueDate}</span>
              </div>
            </div>
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
                width: `${project.progress}%`,
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

      {/* Sacred Subtasks Journey */}
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
            The Sacred Path ({project.subtasks.length} Phases)
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {project.subtasks.map((subtask, index) => (
            <SubtaskCard key={subtask.id} subtask={subtask} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}