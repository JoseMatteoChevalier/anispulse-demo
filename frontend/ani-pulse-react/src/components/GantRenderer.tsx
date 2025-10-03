// GanttRenderer.tsx

interface GanttTask {
    id: string;
    name: string;
    start_day: number;
    end_day: number;
    duration: number;
    is_critical?: boolean;
    risk_level?: string;
    completion_pct?: number;
  }
  
  interface GanttRendererProps {
    tasks: GanttTask[];
    maxDay: number;
    projectStartDate?: string;
    colorScheme: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
    opacity?: number;
    borderStyle?: 'solid' | 'dashed';
    showLabels?: boolean;
    showProgress?: boolean;
    zIndex?: number;
  }
  
  const GanttRenderer = ({
    tasks,
    maxDay,
    projectStartDate,
    colorScheme,
    opacity = 1.0,
    borderStyle = 'solid',
    showLabels = false,
    showProgress = false,
    zIndex = 10
  }: GanttRendererProps) => {
    
    const getRiskColor = (task: GanttTask) => {
      const riskLevel = task.risk_level?.toLowerCase() || 'low';
      if (riskLevel.includes('high')) return colorScheme.high;
      if (riskLevel.includes('medium')) return colorScheme.medium;
      return colorScheme.low;
    };
  
    return (
      <>
        {tasks.map((task) => {
          const barColor = getRiskColor(task);
          const isCritical = task.is_critical;
          
          return (
            <div
              key={task.id}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: `${(task.start_day / maxDay) * 100}%`,
                width: `${(task.duration / maxDay) * 100}%`,
                height: window.innerWidth < 768 ? '20px' : '24px',
                background: barColor,
                opacity: opacity,
                border: `2px ${borderStyle} ${barColor}`,
                borderColor: isCritical ? colorScheme.critical : barColor,
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: zIndex,
                minWidth: '20px'
              }}
            >
              {/* Progress fill if enabled */}
              {showProgress && task.completion_pct > 0 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: barColor,
                  opacity: 1.0,
                  width: `${task.completion_pct}%`,
                  borderRadius: '4px'
                }}></div>
              )}
              
              {/* Label if enabled */}
              {showLabels && (
                <span style={{
                  fontSize: '10px',
                  color: '#FFF',
                  fontWeight: 'bold',
                  padding: '2px 4px',
                  whiteSpace: 'nowrap'
                }}>
                  {task.duration}d
                </span>
              )}
            </div>
          );
        })}
      </>
    );
  };
  
  export default GanttRenderer;