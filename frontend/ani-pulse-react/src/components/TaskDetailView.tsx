

import {ArrowLeft, Calendar, User, Activity, CheckCircle, Clock, AlertCircle, LucideZap, Zap} from "lucide-react";
import { useState, useEffect } from "react"
import { BarChart3 } from "lucide-react"
import { Project, Task } from "../../types/index";
import { RiskAnalytics } from "./RiskAnalytics" // Update this path
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



interface TaskDetailViewProps {
  project: Project;
  onBack: () => void;

}

// Risk-based status configuration
const getRiskStatusConfig = (riskLevel: number) => {
  if (riskLevel >= 4) {
    return {
      color: "#DC143C",
      label: "High Risk",
      icon: AlertCircle,
      glow: "#DC143C40"
    };
  } else if (riskLevel >= 3) {
    return {
      color: "#FFD700",
      label: "Medium Risk",
      icon: Clock,
      glow: "#FFD70040"
    };
  } else {
    return {
      color: "#32CD32",
      label: "Low Risk",
      icon: CheckCircle,
      glow: "#32CD3240"
    };
  }
};

/**
 * Calculate dependency levels for task positioning
 */
function calculateTaskLevels(tasks: Task[]) {
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
function groupTasksByLevel(tasks: Task[], taskLevels: { [key: string]: number }) {
  const groups: { [key: number]: (Task & { originalIndex: number })[] } = {};

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
  return tasksInLevel.map((_, index) => index * cardHeight*1.5);
}

function TaskCard({
  task,
  index,
  isCritical = false,
  isFirstLevel = false,
  isLastLevel = false,
  onUpdate
}: {
  task: Task;
  index: number;
  isCritical?: boolean;
  isFirstLevel?: boolean;
  isLastLevel?: boolean;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const statusInfo = getRiskStatusConfig(task.user_risk_rating);
  const StatusIcon = statusInfo.icon;

  if (isEditing) {
    return (
      <TaskEditForm
        task={task}
        onSave={(updates) => {
          onUpdate?.(task.id, updates);
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
      0 0 15px ${statusInfo.glow},
      0 0 25px #FF000040
    `,
    borderColor: '#FF4444'
  } : {
    boxShadow: `
      inset 0 1px 0 #D4AF3720,
      inset 0 -1px 0 #8B691480,
      0 4px 8px #00000060,
      0 0 15px ${statusInfo.glow}
    `,
    borderColor: '#8B6914'
  };

  return (
    <div
      className="relative rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group h-[360px] overflow-y-auto"
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
      {[
        { top: "4px", left: "4px", clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)" },
        { top: "4px", right: "4px", clipPath: "polygon(100% 0%, 100% 100%, 0% 0%)" },
        { bottom: "4px", left: "4px", clipPath: "polygon(0% 100%, 100% 100%, 0% 0%)" },
        { bottom: "4px", right: "4px", clipPath: "polygon(100% 100%, 0% 100%, 100% 0%)" },
      ].map((style, idx) => (
        <div
          key={idx}
          className="absolute w-4 h-4 opacity-40"
          style={{
            ...style,
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            clipPath: style.clipPath
          }}
        />
      ))}

      {/* Step Number */}
      <div
        className="absolute -top-6 -left-4 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm z-20"
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
            {task.name}
          </h4>
          <div
            className="w-16 h-px mx-auto mb-4"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)'
            }}
          />

          {/* Risk Status Emblem */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm relative mb-1"
            style={{
              background: `linear-gradient(135deg, ${statusInfo.color}15, ${statusInfo.color}25)`,
              color: statusInfo.color,
              border: `2px solid ${statusInfo.color}60`,
              boxShadow: `0 0 12px ${statusInfo.glow}, inset 0 1px 0 ${statusInfo.color}20`,
              textShadow: '0 1px 2px #00000080'
            }}
          >
            <StatusIcon size={16} />
            {statusInfo.label} ({task.user_risk_rating}/5)
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: '#C9A876' }}>
              Completion
            </span>
            <span className="text-sm" style={{ color: '#F4E4BC', textShadow: '0 1px 2px #00000060' }}>
              {task.completion_pct || 0}%
            </span>
          </div>

          {/* Ornate Completion Bar */}
          <div className="relative mb-3">
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
                  width: `${task.completion_pct || 0}%`,
                  background: task.completion_pct === 100
                    ? 'linear-gradient(90deg, #32CD32, #228B22, #32CD32)'
                    : `linear-gradient(90deg, #FFD700, #FFA500, #FFD700)`,
                  boxShadow: task.completion_pct === 100
                    ? '0 0 6px #32CD3260'
                    : '0 0 6px #FFD70060'
                }}
              >
                {/* Progress glow effect */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: task.completion_pct === 100
                      ? 'linear-gradient(90deg, transparent 0%, #32CD32 50%, transparent 100%)'
                      : 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)'
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

        {/* Duration Breakdown */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: '#C9A876' }}>
              Time Breakdown
            </span>
            <span className="text-sm" style={{ color: '#F4E4BC', textShadow: '0 1px 2px #00000060' }}>
              {task.duration_days} days total
            </span>
          </div>

          {/* Time breakdown details */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div className="flex justify-between">
              <span style={{ color: '#C9A876' }}>Completed:</span>
              <span style={{ color: '#32CD32' }}>
                {((task.duration_days * (task.completion_pct || 0)) / 100).toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#C9A876' }}>Remaining:</span>
              <span style={{ color: '#FFD700' }}>
                {(task.duration_days * (1 - (task.completion_pct || 0) / 100)).toFixed(1)} days
              </span>
            </div>
          </div>

          {/* Split Duration Bar - Completed vs Remaining */}
          <div className="relative">
            <div
              className="h-3 rounded-full overflow-hidden border-2 flex"
              style={{
                backgroundColor: '#2D1F1F',
                borderColor: '#8B6914',
                boxShadow: 'inset 0 1px 2px #00000060'
              }}
            >
              {/* Completed portion */}
              <div
                className="h-full transition-all duration-500 ease-out relative"
                style={{
                  width: `${(task.completion_pct || 0)}%`,
                  background: 'linear-gradient(90deg, #32CD32, #228B22, #32CD32)',
                  boxShadow: '0 0 6px #32CD3260'
                }}
              >
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, #32CD32 50%, transparent 100%)'
                  }}
                />
              </div>

              {/* Remaining portion */}
              <div
                className="h-full transition-all duration-500 ease-out relative"
                style={{
                  width: `${100 - (task.completion_pct || 0)}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
                  boxShadow: '0 0 6px #FFD70060'
                }}
              >
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)'
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

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded" style={{ backgroundColor: '#32CD32' }}></div>
              <span style={{ color: '#C9A876' }}>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded" style={{ backgroundColor: '#FFD700' }}></div>
              <span style={{ color: '#C9A876' }}>Remaining</span>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 gap-4 text-sm mb-2">
          <div
            className="flex items-center gap-2 p-2 rounded"
            style={{
              // background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A)',
              border: '3px solid #D4AF3760'
            }}
          >
            <Activity size={16} style={{ color: '#D4AF37' }} />

              <div className="flex-0.8">
              <p style={{ color: '#C9A876' }}>Dependencies :: {task.predecessors.length > 0 ? task.predecessors.join(", ") : "None"}</p>
              <p style={{
                color: '#F4E4BC',
                textShadow: '0 1px 2px #00000060',
                fontSize: '12px'
              }}>
                {/*{task.predecessors.length > 0 ? task.predecessors.join(", ") : "None"}*/}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-1 p-1 rounded"
            style={{
              // background: 'linear-gradient(90deg, #2D1F1F, #3D2A2A)',
               border: '3px solid #D4AF3760'
            }}
          >
            <Zap size={16} style={{ color: '#4fa98e' }} />
            <div className="flex-1">
              <p style={{ color: '#C9A876' }}>Risk Rating</p>
              <p style={{
                color: statusInfo.color,
                textShadow: '0 1px 2px #00000060'
              }}>
                {task.user_risk_rating}/5 - {statusInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-1.5 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
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
            background: `radial-gradient(circle, ${statusInfo.color} 0%, transparent 70%)`
          }}
        />
      </div>
    </div>
  );
}

function GanttLayout({ project, onTaskUpdate }: {
  project: Project;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;})

{
  const taskLevels = calculateTaskLevels(project.tasks);
  const levelGroups = groupTasksByLevel(project.tasks, taskLevels);
  const maxLevel = Object.keys(levelGroups).length > 0 ? Math.max(...Object.keys(levelGroups).map(Number)) : 0;

  const containerWidth = (maxLevel + 1) * 320; // 320px per level (card + spacing)
  const maxTasksInLevel = Object.keys(levelGroups).length > 0 ? Math.max(...Object.values(levelGroups).map(group => group.length)) : 1;
  const containerHeight = Math.max(600, maxTasksInLevel * 280);

  console.log('Tasks data:', project.tasks);
  console.log('Task levels:', taskLevels);


  return (

        <TransformWrapper
      initialScale={0.7}
      minScale={0.5}
      maxScale={2.7}
      centerOnInit={true}
      limitToBounds={true}
      // 🎚 PAN / INERTIA
      velocityAnimation={{ disabled: false, sensitivity: 0.2 }}
      disablePadding={false} // allow some “rubber band” at edges for softness
      // 🎨 ANIMATION / EASING
      smooth={true}        // smooth zoom transitions
      wheel={{ step: 0.17 }} // how fast zoom reacts to mouse wheel
      doubleClick={{ disabled: true }} // disable accidental double-zoom
      // 🖐 TOUCH CONTROLS
      pinch={{ step: 5 }}   // pinch sensitivity (% zoom per pinch)
      panning={{ velocityDisabled: false }} // allows glide on touch drag
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative" style={{ width: '100%', minHeight: `${containerHeight}px` }}>
          {/* Zoom Controls - Fixed Position */}
          <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
            <button
              onClick={() => zoomIn()}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                color: '#D4AF37',
                border: '2px solid #8B3F8B'
              }}
            >
              🔍 +
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                color: '#D4AF37',
                border: '2px solid #8B3F8B'
              }}
            >
              🔍 -
            </button>
            <button
              onClick={() => resetTransform()}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                color: '#D4AF37',
                border: '2px solid #8B3F8B'
              }}
            >
              ↺
            </button>
          </div>

        <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: `${containerHeight}px`,
              overflow: 'visible'
            }}
          >
      {/* Scrollable container for wide Gantt charts */}
      <div
        className="relative p-8"
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
            const isCritical = task.user_risk_rating >= 4; // High risk tasks are "critical"

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

                <TaskCard
                  task={task}
                  index={task.originalIndex}
                  isFirstLevel={isFirstLevel}
                  isLastLevel={isLastLevel}
                  isCritical={isCritical}
                  onUpdate={onTaskUpdate}
                />
              </div>
            );
          });
        })}

        {/* Guide lines for development */}
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
     </TransformComponent>
    </div>
      )}
   </TransformWrapper>
  );
}

function TaskEditForm({ task, onSave, onCancel }: {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(task.name);
  const [duration, setDuration] = useState(task.duration_days);
  const [riskRating, setRiskRating] = useState(task.user_risk_rating);
  const [completionPct, setCompletionPct] = useState(task.completion_pct || 0);

  return (
    <div
      className="p-6 rounded-lg border-2"
      style={{
        background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
        borderColor: '#8B6914'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <h4 className="text-lg mb-4" style={{ color: '#F4E4BC' }}>Edit Task</h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="w-full p-2 rounded"
            style={{
              backgroundColor: '#1A0E0E',
              color: '#F4E4BC',
              border: '1px solid #8B6914'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>Duration (days):</label>
          <input
            type="number"
            min="1"
            max="365"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="w-full p-2 rounded"
            style={{
              backgroundColor: '#1A0E0E',
              color: '#F4E4BC',
              border: '1px solid #8B6914'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>Risk Rating:</label>
          <input
            type="range"
            min="1"
            max="5"
            value={riskRating}
            onChange={(e) => setRiskRating(parseInt(e.target.value))}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full"
          />
          <span style={{ color: '#F4E4BC' }}>{riskRating}/5</span>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>
            Completion Percentage: {completionPct}%
          </label>

          {/* Simplified range input */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={completionPct}
              onChange={(e) => {
                console.log('Range changed to:', e.target.value);
                setCompletionPct(parseInt(e.target.value));
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Number input */}
          <div className="flex items-center gap-4 mb-3">
            <input
              type="number"
              min="0"
              max="100"
              value={completionPct}
              onChange={(e) => {
                console.log('Number changed to:', e.target.value);
                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                setCompletionPct(val);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-20 p-2 rounded text-center"
              style={{
                backgroundColor: '#1A0E0E',
                color: '#F4E4BC',
                border: '1px solid #8B6914'
              }}
            />
            <span style={{ color: '#F4E4BC' }}>%</span>
          </div>

          {/* Visual feedback */}
          <div className="mt-2">
            <div
              className="h-3 rounded-full border-2"
              style={{
                backgroundColor: '#2D1F1F',
                borderColor: '#8B6914'
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${completionPct}%`,
                  backgroundColor: completionPct === 100 ? '#32CD32' : '#FFD700'
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSave({ name, duration_days: duration, user_risk_rating: riskRating, completion_pct: completionPct })}
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
// Core Function
export function TaskDetailView({ project, onBack }: TaskDetailViewProps) {
  const [showRiskAnalytics, setShowRiskAnalytics] = useState(false);
  const [currentProject, setCurrentProject] = useState(project);



  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);


  // 
  if (showRiskAnalytics) {
    return (
      <RiskAnalytics
        project={currentProject}
        onBack={() => setShowRiskAnalytics(false)}
      />
    );
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const updatedProject = {
      ...currentProject,
      tasks: currentProject.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    };
    setCurrentProject(updatedProject);
    console.log('Updating task:', taskId, updates);
  };

  // Calculate project risk status based on average task risk
  const avgRisk = currentProject.tasks.length > 0
    ? currentProject.tasks.reduce((sum, t) => sum + t.user_risk_rating, 0) / currentProject.tasks.length
    : 0;

  const projectStatusConfig = {
    safe: { color: "#32CD32", label: "Low Risk Project", glow: "#32CD3240" },
    caution: { color: "#FFD700", label: "Medium Risk Project", glow: "#FFD70040" },
    risk: { color: "#DC143C", label: "High Risk Project", glow: "#DC143C40" },
  };

  const getProjectStatus = (avgRisk: number) => {
    if (avgRisk >= 4) return 'risk';
    if (avgRisk >= 3) return 'caution';
    return 'safe';
  };

  const statusInfo = projectStatusConfig[getProjectStatus(avgRisk)];

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

      {/* Header */}
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
                className="text-3xl"
                style={{
                  color: '#F4E4BC',
                  textShadow: '0 0 12px #D4AF3750, 0 2px 4px #00000080',
                  fontFamily: 'serif'
                }}
              >
                {currentProject.name} - Task Gantt
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
              Dependency Flow of {currentProject.name}
            </p>

            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div
                className="p-2 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Total Tasks: </span>
                <span style={{ color: '#F4E4BC', textShadow: '0 1px 2px #00000060' }}>
                  {currentProject.tasks.length}
                </span>
              </div>
              <div
                className="p-2 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Total Duration: </span>
                <span style={{ color: '#F4E4BC', textShadow: '0 1px 2px #00000060' }}>
                  {currentProject.tasks.reduce((sum, t) => sum + t.duration_days, 0)} days
                </span>
              </div>
              <div
                className="p-2 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Overall Progress: </span>
                <span style={{ color: '#32CD32', textShadow: '0 1px 2px #00000060' }}>
                  {currentProject.tasks.length > 0 ?
                    ((currentProject.tasks.reduce((sum, t) => sum + (t.completion_pct || 0), 0) / currentProject.tasks.length).toFixed(1)) : 0}%
                </span>
              </div>
              <div
                className="p-2 rounded border"
                style={{
                  background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                  borderColor: '#8B6914'
                }}
              >
                <span style={{ color: '#C9A876' }}>Completed Tasks: </span>
                <span style={{ color: '#32CD32', textShadow: '0 1px 2px #00000060' }}>
                  {currentProject.tasks.filter(t => (t.completion_pct || 0) === 100).length}
                </span>
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

        {/* Mystical Progress Altar - Overall Project Progress */}
        <div className="max-w-7xl relative mt-6">
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
                width: `${currentProject.tasks.length > 0 ?
                  (currentProject.tasks.reduce((sum, t) => sum + (t.completion_pct || 0), 0) / currentProject.tasks.length) : 0}%`,
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

      {/* Task Gantt Layout */}
      <main className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-4">
          <h2
            className="text-2xl mb-2"
            style={{
              color: '#F4E4BC',
              textShadow: '0 0 8px #D4AF3750, 0 2px 4px #00000080',
              fontFamily: 'serif'
            }}
          >
            Task Dependency Flow ({currentProject.tasks.length} Tasks)
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
            Each task flows from left to right based on its dependencies
          </p>
        </div>

        {/* Gantt Layout */}
        <GanttLayout
          project={currentProject}
          onTaskUpdate={handleTaskUpdate}
        />
      </main>
    </div>
  );
}