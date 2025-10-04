import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Circle, X, TrendingUp, Link2, Timer, ArrowLeft } from 'lucide-react';

const GanttChart = ({ project, onBack }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [hoveredTask, setHoveredTask] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const getDateFromDay = (startDate, dayNumber) => {
        if (!startDate) return null;
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayNumber);
        return date;
    };

    const projectData = React.useMemo(() => {
        if (!project?.foundationResults) {
            return {
                project_name: "Large Software Development Project",
                project_start_date: "2025-10-13",
                project_metrics: {
                    total_duration_days: 150,
                    overall_risk_level: "Medium-High",
                    high_risk_task_count: 3,
                    critical_path_ids: ["1", "2", "3", "6", "8", "10", "12", "13", "15"],
                    total_tasks: 15
                },
                tasks: [
                    {
                        id: "1",
                        name: "Project Kickoff",
                        duration_days: 2,
                        scheduled_start_day: 0,
                        scheduled_finish_day: 2,
                        completion_pct: 100,
                        risk_level: "Low",
                        risk_score: 15,
                        is_critical: true,
                        float_days: 0,
                        predecessors: [],
                        blocks_tasks: ["2"]
                    },
                    {
                        id: "2",
                        name: "Requirements Gathering",
                        duration_days: 10,
                        scheduled_start_day: 2,
                        scheduled_finish_day: 12,
                        completion_pct: 80,
                        risk_level: "Low",
                        risk_score: 20,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["1"],
                        blocks_tasks: ["3", "4", "5"]
                    },
                    {
                        id: "3",
                        name: "System Architecture",
                        duration_days: 15,
                        scheduled_start_day: 12,
                        scheduled_finish_day: 27,
                        completion_pct: 60,
                        risk_level: "Medium",
                        risk_score: 35,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["2"],
                        blocks_tasks: ["6"]
                    },
                    {
                        id: "4",
                        name: "Database Design",
                        duration_days: 12,
                        scheduled_start_day: 12,
                        scheduled_finish_day: 24,
                        completion_pct: 40,
                        risk_level: "Medium",
                        risk_score: 35,
                        is_critical: false,
                        float_days: 3,
                        predecessors: ["2"],
                        blocks_tasks: ["6"]
                    },
                    {
                        id: "5",
                        name: "UI/UX Design",
                        duration_days: 14,
                        scheduled_start_day: 12,
                        scheduled_finish_day: 26,
                        completion_pct: 50,
                        risk_level: "Low",
                        risk_score: 20,
                        is_critical: false,
                        float_days: 1,
                        predecessors: ["2"],
                        blocks_tasks: ["7"]
                    },
                    {
                        id: "6",
                        name: "API Development",
                        duration_days: 20,
                        scheduled_start_day: 27,
                        scheduled_finish_day: 47,
                        completion_pct: 20,
                        risk_level: "High",
                        risk_score: 65,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["3", "4"],
                        blocks_tasks: ["7", "8"]
                    },
                    {
                        id: "7",
                        name: "Frontend Development",
                        duration_days: 25,
                        scheduled_start_day: 47,
                        scheduled_finish_day: 72,
                        completion_pct: 10,
                        risk_level: "Medium",
                        risk_score: 35,
                        is_critical: false,
                        float_days: 5,
                        predecessors: ["5", "6"],
                        blocks_tasks: ["9"]
                    },
                    {
                        id: "8",
                        name: "Backend Development",
                        duration_days: 22,
                        scheduled_start_day: 47,
                        scheduled_finish_day: 69,
                        completion_pct: 15,
                        risk_level: "High",
                        risk_score: 90,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["6"],
                        blocks_tasks: ["9", "10"]
                    },
                    {
                        id: "9",
                        name: "Integration Testing",
                        duration_days: 10,
                        scheduled_start_day: 72,
                        scheduled_finish_day: 82,
                        completion_pct: 0,
                        risk_level: "Medium",
                        risk_score: 65,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["7", "8"],
                        blocks_tasks: ["11", "12"]
                    },
                    {
                        id: "10",
                        name: "Security Audit",
                        duration_days: 8,
                        scheduled_start_day: 69,
                        scheduled_finish_day: 77,
                        completion_pct: 0,
                        risk_level: "Very High",
                        risk_score: 90,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["8"],
                        blocks_tasks: ["12"]
                    },
                    {
                        id: "11",
                        name: "Performance Optimization",
                        duration_days: 7,
                        scheduled_start_day: 82,
                        scheduled_finish_day: 89,
                        completion_pct: 0,
                        risk_level: "High",
                        risk_score: 65,
                        is_critical: false,
                        float_days: 8,
                        predecessors: ["9"],
                        blocks_tasks: ["13"]
                    },
                    {
                        id: "12",
                        name: "User Acceptance Testing",
                        duration_days: 10,
                        scheduled_start_day: 82,
                        scheduled_finish_day: 92,
                        completion_pct: 0,
                        risk_level: "Low",
                        risk_score: 20,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["9", "10"],
                        blocks_tasks: ["13", "14"]
                    },
                    {
                        id: "13",
                        name: "Deployment Planning",
                        duration_days: 5,
                        scheduled_start_day: 92,
                        scheduled_finish_day: 97,
                        completion_pct: 0,
                        risk_level: "Medium",
                        risk_score: 35,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["11", "12"],
                        blocks_tasks: ["15"]
                    },
                    {
                        id: "14",
                        name: "Training Materials",
                        duration_days: 6,
                        scheduled_start_day: 92,
                        scheduled_finish_day: 98,
                        completion_pct: 0,
                        risk_level: "Low",
                        risk_score: 20,
                        is_critical: false,
                        float_days: 2,
                        predecessors: ["12"],
                        blocks_tasks: ["15"]
                    },
                    {
                        id: "15",
                        name: "Production Deployment",
                        duration_days: 3,
                        scheduled_start_day: 99,
                        scheduled_finish_day: 102,
                        completion_pct: 0,
                        risk_level: "Very High",
                        risk_score: 90,
                        is_critical: true,
                        float_days: 0,
                        predecessors: ["13", "14"],
                        blocks_tasks: []
                    }
                ]
            };
        }

        const mergedTasks = project.foundationResults.tasks.map(foundationTask => {
            const originalTask = project.tasks.find(t => t.id === foundationTask.id);
            return {
                ...foundationTask,
                completion_pct: originalTask?.completion_pct || 0
            };
        });

        return {
            project_name: project.foundationResults.project_name,
            project_start_date: project.foundationResults.project_start_date,
            project_metrics: project.foundationResults.project_metrics,
            tasks: mergedTasks
        };
    }, [project]);

    const maxDay = Math.max(...projectData.tasks.map(t => t.scheduled_finish_day));
    const weeksCount = Math.ceil(maxDay / 7);

    // Calculate current day based on actual dates
    const getCurrentDay = () => {
        if (!projectData.project_start_date) return null;
        const startDate = new Date(projectData.project_start_date);
        const today = new Date();
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= maxDay ? diffDays : null;
    };

    const currentDay = getCurrentDay();

    const getRiskColor = (task) => {
        const score = task.risk_score || 0;
        if (score >= 60) {
            return { bg: '#DC2626', border: '#EF4444', text: '#FCA5A5', label: 'High' };
        } else if (score >= 30) {
            return { bg: '#CA8A04', border: '#EAB308', text: '#FDE047', label: 'Medium' };
        } else {
            return { bg: '#059669', border: '#10B981', text: '#6EE7B7', label: 'Low' };
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setPanelOpen(true);
    };

    const handleTaskHover = (task, event) => {
        setHoveredTask(task);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const closePanel = () => {
        setPanelOpen(false);
        setTimeout(() => setSelectedTask(null), 300);
    };

    // Build critical path connections with actual task indices
    const getCriticalPathConnections = () => {
        const criticalTasks = projectData.tasks
            .map((task, index) => ({ ...task, index }))
            .filter(t => t.is_critical)
            .sort((a, b) => a.scheduled_start_day - b.scheduled_start_day);

        const connections = [];
        for (let i = 0; i < criticalTasks.length - 1; i++) {
            const currentTask = criticalTasks[i];
            const nextTask = criticalTasks[i + 1];

            if (nextTask.predecessors?.includes(currentTask.id)) {
                connections.push({
                    fromTask: currentTask,
                    toTask: nextTask
                });
            }
        }
        return connections;
    };

    const criticalPathConnections = getCriticalPathConnections();

    return (
        <div style={{
            minHeight: '100vh',
            padding: window.innerWidth < 768 ? '16px' : '32px',
            background: "linear-gradient(135deg, #0f0a08 0%, #1a1210 25%, #2D1F1F 50%, #1a1210 75%, #0f0a08 100%)"
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                    }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(107, 80, 16, 0.5)',
                                    background: 'rgba(23, 15, 5, 0.5)',
                                    color: '#D4AF37',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.7)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.5)'}
                            >
                                <ArrowLeft style={{ width: '20px', height: '20px' }} />
                            </button>
                        )}
                        <div>
                            <h1 style={{
                                fontSize: window.innerWidth < 768 ? '24px' : '36px',
                                fontWeight: 'bold',
                                color: '#F4E4BC',
                                marginBottom: '8px'
                            }}>
                                {projectData.project_name}
                            </h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
                        <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>Duration: {projectData.project_metrics.total_duration_days} days</span>
                        <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>•</span>
                        <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>Risk: {projectData.project_metrics.overall_risk_level}</span>
                        <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>•</span>
                        <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>Critical Path: {projectData.project_metrics.critical_path_ids.length} tasks</span>
                    </div>
                </div>

                {/* Gantt Container */}
                <div style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '2px solid #6b5010',
                    background: "linear-gradient(135deg, #1a1210 0%, #2D1F1F 25%, #3a2420 50%, #2D1F1F 75%, #1a1210 100%)",
                    boxShadow: "inset 0 1px 0 rgba(139, 105, 20, 0.15), 0 4px 8px rgba(0, 0, 0, 0.5)"
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ padding: window.innerWidth < 768 ? '16px' : '24px', minWidth: '800px' }}>
                            {/* Week Headers */}
                            <div style={{ display: 'flex', marginBottom: '16px' }}>
                                <div style={{ width: window.innerWidth < 768 ? '192px' : '256px', flexShrink: 0 }}></div>
                                <div style={{ flex: 1, display: 'flex' }}>
                                    {[...Array(weeksCount)].map((_, i) => {
                                        const weekStartDay = i * 7;
                                        const weekDate = getDateFromDay(projectData.project_start_date, weekStartDay);
                                        const dateLabel = weekDate
                                            ? weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            : `W${i + 1}`;

                                        return (
                                            <div key={i} style={{
                                                flex: 1,
                                                textAlign: 'center',
                                                borderLeft: '1px solid rgba(217, 119, 6, 0.3)'
                                            }}>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: 'rgba(245, 158, 11, 0.8)'
                                                }}>{dateLabel}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tasks */}
                            {projectData.tasks.map((task, taskIndex) => {
                                const riskColors = getRiskColor(task);
                                const isCritical = task.is_critical;

                                return (
                                    <div
                                        key={task.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            transition: 'background 0.2s',
                                            position: 'relative'
                                        }}
                                        onClick={() => handleTaskClick(task)}
                                        onMouseEnter={(e) => handleTaskHover(task, e)}
                                        onMouseLeave={() => setHoveredTask(null)}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Task Info */}
                                        <div style={{
                                            width: window.innerWidth < 768 ? '192px' : '256px',
                                            flexShrink: 0,
                                            paddingRight: window.innerWidth < 768 ? '8px' : '16px',
                                            paddingTop: '8px',
                                            paddingBottom: '8px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '4px'
                                            }}>
                                                {isCritical && <AlertTriangle style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    color: '#EF4444',
                                                    flexShrink: 0
                                                }} />}
                                                <span style={{
                                                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                                                    color: '#FDE68A',
                                                    fontWeight: '500',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {task.name}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '12px',
                                                color: 'rgba(245, 158, 11, 0.6)'
                                            }}>
                                                <span style={{ color: riskColors.text }}>{riskColors.label} Risk</span>
                                                {task.completion_pct > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{task.completion_pct}%</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gantt Bar */}
                                        <div style={{ flex: 1, position: 'relative', height: '40px', overflow:'visible' }}>
                                            {/* Grid lines */}
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                                                {[...Array(weeksCount)].map((_, i) => (
                                                    <div key={i} style={{
                                                        flex: 1,
                                                        borderLeft: '1px solid rgba(217, 119, 6, 0.2)'
                                                    }}></div>
                                                ))}
                                            </div>

                                            {/* Today marker */}
                                            {currentDay !== null && currentDay <= maxDay && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '2px',
                                                    background: '#EF4444',
                                                    zIndex: 20,
                                                    left: `${(currentDay / maxDay) * 100}%`
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-4px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '8px',
                                                        height: '8px',
                                                        background: '#EF4444',
                                                        borderRadius: '50%'
                                                    }}></div>
                                                </div>
                                            )}

                                            {/* Critical path connections - drawn for each task row */}
                                            {criticalPathConnections.map((conn, idx) => {
                                                if (conn.fromTask.index === taskIndex) {
                                                    const fromX = (conn.fromTask.scheduled_finish_day / maxDay) * 100;
                                                    const toX = (conn.toTask.scheduled_start_day / maxDay) * 100;
                                                    const rowHeight = 48; // approximate row height with margin
                                                    const targetRowIndex = conn.toTask.index;
                                                    const rowsToJump = targetRowIndex - taskIndex;
                                                    const yOffset = rowsToJump * rowHeight;

                                                    return (
                                                        <svg
                                                            key={idx}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                width: '100%',  // ADD THIS
                                                                height: `${Math.abs(yOffset) + 40}px`,
                                                                pointerEvents: 'none',
                                                                zIndex: 15,
                                                                overflow: 'visible'
                                                            }}
                                                        >
                                                            <path
                                                                d={`M ${fromX}% 20 L ${toX}% ${20 + yOffset}`}
                                                                stroke="#EAB308"
                                                                strokeWidth="2"
                                                                fill="none"
                                                                opacity="0.6"
                                                                markerEnd="url(#arrowhead)"
                                                            />
                                                            <defs>
                                                                <marker
                                                                    id="arrowhead"
                                                                    markerWidth="10"
                                                                    markerHeight="10"
                                                                    refX="9"
                                                                    refY="3"
                                                                    orient="auto"
                                                                >
                                                                    <polygon points="0 0, 10 3, 0 6" fill="#EAB308" />
                                                                </marker>
                                                            </defs>
                                                        </svg>
                                                    );
                                                }
                                                return null;
                                            })}

                                            {/* Task bar */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    height: window.innerWidth < 768 ? '24px' : '28px',
                                                    borderRadius: '4px',
                                                    transition: 'height 0.2s',
                                                    left: `${(task.scheduled_start_day / maxDay) * 100}%`,
                                                    width: `${(task.duration_days / maxDay) * 100}%`,
                                                    minWidth: '20px',
                                                    zIndex: 10
                                                }}
                                            >
                                                {/* Background with risk color */}
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: riskColors.bg,
                                                    opacity: 0.3,
                                                    borderRadius: '4px',
                                                    border: `1px solid ${riskColors.border}`
                                                }}></div>

                                                {/* Progress fill */}
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: riskColors.bg,
                                                    borderRadius: '4px',
                                                    transition: 'width 0.5s',
                                                    width: `${task.completion_pct}%`
                                                }}></div>

                                                {/* Critical path indicator */}
                                                {isCritical && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        border: '2px solid rgba(234, 179, 8, 0.5)',
                                                        borderRadius: '4px'
                                                    }}></div>
                                                )}

                                                {/* Progress text */}
                                                {task.completion_pct > 0 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                                        }}>
                                                            {task.completion_pct}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div style={{
                        borderTop: '1px solid rgba(217, 119, 6, 0.3)',
                        padding: '12px 16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        fontSize: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle style={{ width: '12px', height: '12px', color: '#EF4444' }} />
                            <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Critical Path</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '16px',
                                height: '2px',
                                background: '#EAB308'
                            }}></div>
                            <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Dependencies</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                background: '#059669',
                                borderRadius: '2px'
                            }}></div>
                            <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Low Risk</span>
                        </div>
                        {currentDay !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '2px',
                                    height: '12px',
                                    background: '#EF4444'
                                }}></div>
                                <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Today</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Tooltip */}
            {hoveredTask && (
                <div style={{
                    position: 'fixed',
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: 'translate(-50%, -100%)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(23, 15, 5, 0.95)',
                    border: '1px solid rgba(217, 119, 6, 0.5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                    pointerEvents: 'none',
                    minWidth: '200px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#FDE68A',
                        marginBottom: '8px'
                    }}>
                        {hoveredTask.name}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'rgba(245, 158, 11, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Duration:</span>
                            <span style={{ color: '#FDE68A' }}>{hoveredTask.duration_days} days</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Progress:</span>
                            <span style={{ color: '#FDE68A' }}>{hoveredTask.completion_pct}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Risk:</span>
                            <span style={{ color: getRiskColor(hoveredTask).text }}>{hoveredTask.risk_level}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Float:</span>
                            <span style={{ color: '#FDE68A' }}>{hoveredTask.float_days} days</span>
                        </div>
                        {hoveredTask.is_critical && (
                            <div style={{
                                marginTop: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                textAlign: 'center',
                                color: '#FCA5A5'
                            }}>
                                Critical Path
                            </div>
                        )}
                    </div>
                    {/* Tooltip arrow */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '12px',
                        height: '12px',
                        background: 'rgba(23, 15, 5, 0.95)',
                        border: '1px solid rgba(217, 119, 6, 0.5)',
                        borderTop: 'none',
                        borderLeft: 'none',
                        transform: 'translateX(-50%) rotate(45deg)'
                    }}></div>
                </div>
            )}

            {/* Sliding Side Panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: window.innerWidth < 768 ? '100%' : '320px',
                transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out',
                zIndex: 50
            }}>
                <div style={{
                    height: '100%',
                    borderLeft: '2px solid #6b5010',
                    background: "linear-gradient(135deg, #1a1210 0%, #2D1F1F 25%, #3a2420 50%, #2D1F1F 75%, #1a1210 100%)",
                    boxShadow: "inset 0 1px 0 rgba(139, 105, 20, 0.15), -4px 0 16px rgba(0, 0, 0, 0.5)",
                    overflowY: 'auto'
                }}>
                    {selectedTask && (
                        <div style={{ padding: '24px' }}>
                            {/* Close Button */}
                            <button
                                onClick={closePanel}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: 'rgba(23, 15, 5, 0.7)',
                                    border: '1px solid rgba(217, 119, 6, 0.3)',
                                    color: '#F59E0B',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.9)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.7)'}
                            >
                                <X style={{ width: '20px', height: '20px' }} />
                            </button>

                            {/* Task Header */}
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#FDE68A',
                                    marginBottom: '8px',
                                    paddingRight: '40px'
                                }}>{selectedTask.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    {selectedTask.is_critical && (
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '9999px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(239, 68, 68, 0.5)',
                                            color: '#FCA5A5',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <AlertTriangle style={{ width: '12px', height: '12px' }} />
                                            Critical Path
                                        </span>
                                    )}
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '9999px',
                                        background: getRiskColor(selectedTask).bg,
                                        opacity: 0.8,
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {selectedTask.risk_level} Risk
                                    </span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    color: 'rgba(201, 168, 118, 0.7)',
                                    marginBottom: '8px'
                                }}>
                                    <span>Progress</span>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#FDE68A'
                                    }}>{selectedTask.completion_pct}%</span>
                                </div>
                                <div style={{
                                    height: '12px',
                                    background: 'rgba(23, 15, 5, 0.5)',
                                    borderRadius: '9999px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(217, 119, 6, 0.3)'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        background: getRiskColor(selectedTask).bg,
                                        transition: 'width 0.5s',
                                        width: `${selectedTask.completion_pct}%`
                                    }}></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(23, 15, 5, 0.3)',
                                    border: '1px solid rgba(217, 119, 6, 0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'rgba(245, 158, 11, 0.7)',
                                        fontSize: '12px',
                                        marginBottom: '4px'
                                    }}>
                                        <Timer style={{ width: '12px', height: '12px' }} />
                                        Duration
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#FDE68A'
                                    }}>{selectedTask.duration_days}d</div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(23, 15, 5, 0.3)',
                                    border: '1px solid rgba(217, 119, 6, 0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'rgba(245, 158, 11, 0.7)',
                                        fontSize: '12px',
                                        marginBottom: '4px'
                                    }}>
                                        <TrendingUp style={{ width: '12px', height: '12px' }} />
                                        Float
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#FDE68A'
                                    }}>{selectedTask.float_days}d</div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(23, 15, 5, 0.3)',
                                    border: '1px solid rgba(217, 119, 6, 0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'rgba(245, 158, 11, 0.7)',
                                        fontSize: '12px',
                                        marginBottom: '4px'
                                    }}>
                                        <Calendar style={{ width: '12px', height: '12px' }} />
                                        Start Day
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#FDE68A'
                                    }}>{selectedTask.scheduled_start_day}</div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(23, 15, 5, 0.3)',
                                    border: '1px solid rgba(217, 119, 6, 0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'rgba(245, 158, 11, 0.7)',
                                        fontSize: '12px',
                                        marginBottom: '4px'
                                    }}>
                                        <Calendar style={{ width: '12px', height: '12px' }} />
                                        End Day
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#FDE68A'
                                    }}>{selectedTask.scheduled_finish_day}</div>
                                </div>
                            </div>

                            {/* Dependencies */}
                            {selectedTask.predecessors && selectedTask.predecessors.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        color: 'rgba(201, 168, 118, 0.7)',
                                        marginBottom: '8px'
                                    }}>
                                        <Link2 style={{ width: '16px', height: '16px' }} />
                                        Depends On
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {selectedTask.predecessors.map(predId => {
                                            const pred = projectData.tasks.find(t => t.id === predId);
                                            return pred ? (
                                                <span key={predId} style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    background: 'rgba(23, 15, 5, 0.5)',
                                                    border: '1px solid rgba(217, 119, 6, 0.5)',
                                                    fontSize: '12px',
                                                    color: '#FDE68A'
                                                }}>
                                                    {pred.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Blocks */}
                            {selectedTask.blocks_tasks && selectedTask.blocks_tasks.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        color: 'rgba(201, 168, 118, 0.7)',
                                        marginBottom: '8px'
                                    }}>
                                        <Link2 style={{ width: '16px', height: '16px' }} />
                                        Blocks
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {selectedTask.blocks_tasks.map(blockId => {
                                            const blocked = projectData.tasks.find(t => t.id === blockId);
                                            return blocked ? (
                                                <span key={blockId} style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    background: 'rgba(23, 15, 5, 0.5)',
                                                    border: '1px solid rgba(217, 119, 6, 0.5)',
                                                    fontSize: '12px',
                                                    color: '#FDE68A'
                                                }}>
                                                    {blocked.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop */}
            {panelOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 40
                    }}
                    onClick={closePanel}
                ></div>
            )}
        </div>
    );
};

export default GanttChart;



// import React, { useState } from 'react';
// import { Calendar, Clock, AlertTriangle, CheckCircle2, Circle, X, TrendingUp, Link2, Timer, ArrowLeft } from 'lucide-react';
// import GanttRenderer from './GantRenderer';
// import {
//   normalizeFoundationData,
//   normalizePDEData,
//   normalizeMonteCarloData,
//   normalizeSDEData
// } from './utils/gant_normalizer';
//
// const GanttChart = ({ project, onBack }) => {
//     const [selectedTask, setSelectedTask] = useState(null);
//     const [panelOpen, setPanelOpen] = useState(false);
//     const [hoveredTask, setHoveredTask] = useState(null);
//     const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
//
//     // Overlay toggles
//     const [showPdeOverlay, setShowPdeOverlay] = useState(false);
//     const [showMCOverlay, setShowMCOverlay] = useState(false);
//     const [showSDEOverlay, setShowSDEOverlay] = useState(false);
//
//     // Normalize all data sources
//     const foundationData = normalizeFoundationData(project);
//     const pdeData = normalizePDEData(project);
//     const mcData = normalizeMonteCarloData(project);
//     const sdeData = normalizeSDEData(project);
//
//     const getDateFromDay = (startDate, dayNumber) => {
//         if (!startDate) return null;
//         const date = new Date(startDate);
//         date.setDate(date.getDate() + dayNumber);
//         return date;
//     };
//
//     const projectData = React.useMemo(() => {
//         if (!project?.foundationResults) {
//             return {
//                 project_name: "Large Software Development Project",
//                 project_start_date: "2025-01-01",
//                 project_metrics: {
//                     total_duration_days: 150,
//                     overall_risk_level: "Medium-High",
//                     high_risk_task_count: 3,
//                     critical_path_ids: ["1", "2", "3", "6", "8", "10", "12", "13", "15"],
//                     total_tasks: 15
//                 },
//                 tasks: [] // Use empty for hardcoded fallback
//             };
//         }
//
//         const mergedTasks = project.foundationResults.tasks.map(foundationTask => {
//             const originalTask = project.tasks.find(t => t.id === foundationTask.id);
//             return {
//                 ...foundationTask,
//                 completion_pct: originalTask?.completion_pct || 0
//             };
//         });
//
//         return {
//             project_name: project.foundationResults.project_name,
//             project_start_date: project.foundationResults.project_start_date,
//             project_metrics: project.foundationResults.project_metrics,
//             tasks: mergedTasks
//         };
//     }, [project]);
//
//     // Calculate unified timeline
//     const unifiedMaxDay = React.useMemo(() => {
//         const foundationMax = foundationData?.maxDay || 0;
//         const pdeMax = showPdeOverlay && pdeData ? pdeData.maxDay : 0;
//         const mcMax = showMCOverlay && mcData ? mcData.maxDay : 0;
//         const sdeMax = showSDEOverlay && sdeData ? sdeData.maxDay : 0;
//
//         const max = Math.max(foundationMax, pdeMax, mcMax, sdeMax);
//         return max || 1; // Never return 0
//     }, [foundationData, pdeData, mcData, sdeData, showPdeOverlay, showMCOverlay, showSDEOverlay]);
//
//     const weeksCount = Math.ceil(unifiedMaxDay / 7);
//
//     const getCurrentDay = () => {
//         if (!projectData.project_start_date) return null;
//         const startDate = new Date(projectData.project_start_date);
//         const today = new Date();
//         const diffTime = today - startDate;
//         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//         return diffDays >= 0 && diffDays <= unifiedMaxDay ? diffDays : null;
//     };
//
//     const currentDay = getCurrentDay();
//
//     const getRiskColor = (task) => {
//         const score = task.risk_score || 0;
//         if (score >= 60) {
//             return { bg: '#DC2626', border: '#EF4444', text: '#FCA5A5', label: 'High' };
//         } else if (score >= 30) {
//             return { bg: '#CA8A04', border: '#EAB308', text: '#FDE047', label: 'Medium' };
//         } else {
//             return { bg: '#059669', border: '#10B981', text: '#6EE7B7', label: 'Low' };
//         }
//     };
//
//     const handleTaskClick = (task) => {
//         setSelectedTask(task);
//         setPanelOpen(true);
//     };
//
//     const handleTaskHover = (task, event) => {
//         setHoveredTask(task);
//         const rect = event.currentTarget.getBoundingClientRect();
//         setTooltipPosition({
//             x: rect.left + rect.width / 2,
//             y: rect.top - 10
//         });
//     };
//
//     const closePanel = () => {
//         setPanelOpen(false);
//         setTimeout(() => setSelectedTask(null), 300);
//     };
//
//     const getCriticalPathConnections = () => {
//         const criticalTasks = projectData.tasks
//             .map((task, index) => ({ ...task, index }))
//             .filter(t => t.is_critical)
//             .sort((a, b) => a.scheduled_start_day - b.scheduled_start_day);
//
//         const connections = [];
//         for (let i = 0; i < criticalTasks.length - 1; i++) {
//             const currentTask = criticalTasks[i];
//             const nextTask = criticalTasks[i + 1];
//
//             if (nextTask.predecessors?.includes(currentTask.id)) {
//                 connections.push({
//                     fromTask: currentTask,
//                     toTask: nextTask
//                 });
//             }
//         }
//         return connections;
//     };
//
//     const criticalPathConnections = getCriticalPathConnections();
//
//     return (
//         <div style={{
//             minHeight: '100vh',
//             padding: window.innerWidth < 768 ? '16px' : '32px',
//             background: "linear-gradient(135deg, #0f0a08 0%, #1a1210 25%, #2D1F1F 50%, #1a1210 75%, #0f0a08 100%)"
//         }}>
//             <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
//                 {/* Header */}
//                 <div style={{ marginBottom: '24px' }}>
//                     <div style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '16px',
//                         marginBottom: '16px',
//                         flexWrap: 'wrap'
//                     }}>
//                         {onBack && (
//                             <button
//                                 onClick={onBack}
//                                 style={{
//                                     padding: '8px',
//                                     borderRadius: '8px',
//                                     border: '1px solid rgba(107, 80, 16, 0.5)',
//                                     background: 'rgba(23, 15, 5, 0.5)',
//                                     color: '#D4AF37',
//                                     cursor: 'pointer',
//                                     transition: 'background 0.2s',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center'
//                                 }}
//                                 onMouseOver={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.7)'}
//                                 onMouseOut={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.5)'}
//                             >
//                                 <ArrowLeft style={{ width: '20px', height: '20px' }} />
//                             </button>
//                         )}
//                         <div>
//                             <h1 style={{
//                                 fontSize: window.innerWidth < 768 ? '24px' : '36px',
//                                 fontWeight: 'bold',
//                                 color: '#F4E4BC',
//                                 marginBottom: '8px'
//                             }}>
//                                 {projectData.project_name}
//                             </h1>
//                         </div>
//                     </div>
//                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
//                         <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>Duration: {projectData.project_metrics.total_duration_days} days</span>
//                         <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>•</span>
//                         <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>Risk: {projectData.project_metrics.overall_risk_level}</span>
//                         <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>•</span>
//                         <span style={{ color: 'rgba(251, 191, 36, 0.6)' }}>Critical Path: {projectData.project_metrics.critical_path_ids.length} tasks</span>
//                     </div>
//
//                     {/* Overlay Toggles */}
//                     <div style={{
//                         marginTop: '16px',
//                         display: 'flex',
//                         gap: '16px',
//                         flexWrap: 'wrap'
//                     }}>
//                         {pdeData && (
//                             <label style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 padding: '8px 12px',
//                                 borderRadius: '8px',
//                                 background: 'rgba(139, 92, 246, 0.1)',
//                                 border: '1px solid rgba(139, 92, 246, 0.3)',
//                                 color: '#C4B5FD',
//                                 cursor: 'pointer'
//                             }}>
//                                 <input
//                                     type="checkbox"
//                                     checked={showPdeOverlay}
//                                     onChange={(e) => setShowPdeOverlay(e.target.checked)}
//                                     style={{ cursor: 'pointer' }}
//                                 />
//                                 Show PDE Overlay
//                             </label>
//                         )}
//                         {mcData && (
//                             <label style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 padding: '8px 12px',
//                                 borderRadius: '8px',
//                                 background: 'rgba(16, 185, 129, 0.1)',
//                                 border: '1px solid rgba(16, 185, 129, 0.3)',
//                                 color: '#6EE7B7',
//                                 cursor: 'pointer'
//                             }}>
//                                 <input
//                                     type="checkbox"
//                                     checked={showMCOverlay}
//                                     onChange={(e) => setShowMCOverlay(e.target.checked)}
//                                     style={{ cursor: 'pointer' }}
//                                 />
//                                 Show Monte Carlo Overlay
//                             </label>
//                         )}
//                         {sdeData && (
//                             <label style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px',
//                                 padding: '8px 12px',
//                                 borderRadius: '8px',
//                                 background: 'rgba(245, 158, 11, 0.1)',
//                                 border: '1px solid rgba(245, 158, 11, 0.3)',
//                                 color: '#FCD34D',
//                                 cursor: 'pointer'
//                             }}>
//                                 <input
//                                     type="checkbox"
//                                     checked={showSDEOverlay}
//                                     onChange={(e) => setShowSDEOverlay(e.target.checked)}
//                                     style={{ cursor: 'pointer' }}
//                                 />
//                                 Show SDE Overlay
//                             </label>
//                         )}
//                     </div>
//                 </div>
//
//                 {/* Gantt Container */}
//                 <div style={{
//                     position: 'relative',
//                     borderRadius: '16px',
//                     overflow: 'hidden',
//                     border: '2px solid #6b5010',
//                     background: "linear-gradient(135deg, #1a1210 0%, #2D1F1F 25%, #3a2420 50%, #2D1F1F 75%, #1a1210 100%)",
//                     boxShadow: "inset 0 1px 0 rgba(139, 105, 20, 0.15), 0 4px 8px rgba(0, 0, 0, 0.5)"
//                 }}>
//                     <div style={{ overflowX: 'auto' }}>
//                         <div style={{ padding: window.innerWidth < 768 ? '16px' : '24px', minWidth: '800px' }}>
//                             {/* Week Headers */}
//                             <div style={{ display: 'flex', marginBottom: '16px' }}>
//                                 <div style={{ width: window.innerWidth < 768 ? '192px' : '256px', flexShrink: 0 }}></div>
//                                 <div style={{ flex: 1, display: 'flex' }}>
//                                     {[...Array(weeksCount)].map((_, i) => {
//                                         const weekStartDay = i * 7;
//                                         const weekDate = getDateFromDay(projectData.project_start_date, weekStartDay);
//                                         const dateLabel = weekDate
//                                             ? weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//                                             : `W${i + 1}`;
//
//                                         return (
//                                             <div key={i} style={{
//                                                 flex: 1,
//                                                 textAlign: 'center',
//                                                 borderLeft: '1px solid rgba(217, 119, 6, 0.3)'
//                                             }}>
//                                                 <div style={{
//                                                     fontSize: '11px',
//                                                     fontWeight: '600',
//                                                     color: 'rgba(245, 158, 11, 0.8)'
//                                                 }}>{dateLabel}</div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//
//                             {/* Tasks */}
//                             {projectData.tasks.map((task, taskIndex) => {
//                                 const riskColors = getRiskColor(task);
//                                 const isCritical = task.is_critical;
//
//                                 return (
//                                     <div
//                                         key={task.id}
//                                         style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             marginBottom: '8px',
//                                             cursor: 'pointer',
//                                             borderRadius: '8px',
//                                             transition: 'background 0.2s',
//                                             position: 'relative'
//                                         }}
//                                         onClick={() => handleTaskClick(task)}
//                                         onMouseEnter={(e) => handleTaskHover(task, e)}
//                                         onMouseLeave={() => setHoveredTask(null)}
//                                         onMouseOver={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)'}
//                                         onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
//                                     >
//                                         {/* Task Info */}
//                                         <div style={{
//                                             width: window.innerWidth < 768 ? '192px' : '256px',
//                                             flexShrink: 0,
//                                             paddingRight: window.innerWidth < 768 ? '8px' : '16px',
//                                             paddingTop: '8px',
//                                             paddingBottom: '8px'
//                                         }}>
//                                             <div style={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '8px',
//                                                 marginBottom: '4px'
//                                             }}>
//                                                 {isCritical && <AlertTriangle style={{
//                                                     width: '12px',
//                                                     height: '12px',
//                                                     color: '#EF4444',
//                                                     flexShrink: 0
//                                                 }} />}
//                                                 <span style={{
//                                                     fontSize: window.innerWidth < 768 ? '12px' : '14px',
//                                                     color: '#FDE68A',
//                                                     fontWeight: '500',
//                                                     overflow: 'hidden',
//                                                     textOverflow: 'ellipsis',
//                                                     whiteSpace: 'nowrap'
//                                                 }}>
//                                                     {task.name}
//                                                 </span>
//                                             </div>
//                                             <div style={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '8px',
//                                                 fontSize: '12px',
//                                                 color: 'rgba(245, 158, 11, 0.6)'
//                                             }}>
//                                                 <span style={{ color: riskColors.text }}>{riskColors.label} Risk</span>
//                                                 {task.completion_pct > 0 && (
//                                                     <>
//                                                         <span>•</span>
//                                                         <span>{task.completion_pct}%</span>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>
//
//                                         {/* Gantt Timeline */}
//                                         <div style={{ flex: 1, position: 'relative', height: '40px', overflow:'visible' }}>
//                                             {/* Grid lines */}
//                                             <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
//                                                 {[...Array(weeksCount)].map((_, i) => (
//                                                     <div key={i} style={{
//                                                         flex: 1,
//                                                         borderLeft: '1px solid rgba(217, 119, 6, 0.2)'
//                                                     }}></div>
//                                                 ))}
//                                             </div>
//
//                                             {/* Today marker */}
//                                             {currentDay !== null && currentDay <= unifiedMaxDay && (
//                                                 <div style={{
//                                                     position: 'absolute',
//                                                     top: 0,
//                                                     bottom: 0,
//                                                     width: '2px',
//                                                     background: '#EF4444',
//                                                     zIndex: 20,
//                                                     left: `${(currentDay / unifiedMaxDay) * 100}%`
//                                                 }}>
//                                                     <div style={{
//                                                         position: 'absolute',
//                                                         top: '-4px',
//                                                         left: '50%',
//                                                         transform: 'translateX(-50%)',
//                                                         width: '8px',
//                                                         height: '8px',
//                                                         background: '#EF4444',
//                                                         borderRadius: '50%'
//                                                     }}></div>
//                                                 </div>
//                                             )}
//
//                                             {/* Critical path connections */}
//                                             {criticalPathConnections.map((conn, idx) => {
//                                                  if (conn.fromTask.index === taskIndex && unifiedMaxDay > 0) {
//                                                     const fromX = (conn.fromTask.scheduled_finish_day / unifiedMaxDay) * 100;
//                                                     const toX = (conn.toTask.scheduled_start_day / unifiedMaxDay) * 100;
//                                                     const rowHeight = 48;
//                                                     const targetRowIndex = conn.toTask.index;
//                                                     const rowsToJump = targetRowIndex - taskIndex;
//                                                     const yOffset = rowsToJump * rowHeight;
//                                                     if (!isFinite(fromX) || !isFinite(toX)) return null;
//
//                                                     return (
//                                                         <svg
//                                                             key={idx}
//                                                             style={{
//                                                                 position: 'absolute',
//                                                                 top: 0,
//                                                                 left: 0,
//                                                                 right: 0,
//                                                                 width: '100%',
//                                                                 height: `${Math.abs(yOffset) + 40}px`,
//                                                                 pointerEvents: 'none',
//                                                                 zIndex: 15,
//                                                                 overflow: 'visible'
//                                                             }}
//                                                         >
//                                                             <path
//                                                                 d={`M ${fromX}% 20 L ${toX}% ${20 + yOffset}`}
//                                                                 stroke="#EAB308"
//                                                                 strokeWidth="2"
//                                                                 fill="none"
//                                                                 opacity="0.6"
//                                                                 markerEnd="url(#arrowhead)"
//                                                             />
//                                                             <defs>
//                                                                 <marker
//                                                                     id="arrowhead"
//                                                                     markerWidth="10"
//                                                                     markerHeight="10"
//                                                                     refX="9"
//                                                                     refY="3"
//                                                                     orient="auto"
//                                                                 >
//                                                                     <polygon points="0 0, 10 3, 0 6" fill="#EAB308" />
//                                                                 </marker>
//                                                             </defs>
//                                                         </svg>
//                                                     );
//                                                 }
//                                                 return null;
//                                             })}
//
//                                             {/* Foundation bar using GanttRenderer */}
//                                             <GanttRenderer
//                                                 tasks={[{
//                                                     id: task.id,
//                                                     name: task.name,
//                                                     start_day: task.scheduled_start_day,
//                                                     end_day: task.scheduled_finish_day,
//                                                     duration: task.duration_days,
//                                                     is_critical: task.is_critical,
//                                                     risk_level: task.risk_level,
//                                                     completion_pct: task.completion_pct
//                                                 }]}
//                                                 maxDay={unifiedMaxDay}
//                                                 colorScheme={{
//                                                     low: '#059669',
//                                                     medium: '#CA8A04',
//                                                     high: '#DC2626',
//                                                     critical: '#EAB308'
//                                                 }}
//                                                 opacity={1.0}
//                                                 borderStyle="solid"
//                                                 showProgress={true}
//                                                 zIndex={10}
//                                             />
//
//                                             {/* PDE overlay */}
//                                             {showPdeOverlay && pdeData && (() => {
//                                                 const pdeTask = pdeData.tasks.find(t => t.id === task.id);
//                                                 if (!pdeTask) return null;
//
//                                                 return (
//                                                     <GanttRenderer
//                                                         tasks={[pdeTask]}
//                                                         maxDay={unifiedMaxDay}
//                                                         colorScheme={{
//                                                             low: '#8b5cf6',
//                                                             medium: '#8b5cf6',
//                                                             high: '#8b5cf6',
//                                                             critical: '#8b5cf6'
//                                                         }}
//                                                         opacity={0.5}
//                                                         borderStyle="dashed"
//                                                         showLabels={false}
//                                                         zIndex={11}
//                                                     />
//                                                 );
//                                             })()}
//
//                                             {/* Monte Carlo overlay */}
//                                             {showMCOverlay && mcData && (() => {
//                                                 const mcTask = mcData.tasks.find(t => t.id === task.id);
//                                                 if (!mcTask) return null;
//
//                                                 return (
//                                                     <GanttRenderer
//                                                         tasks={[mcTask]}
//                                                         maxDay={unifiedMaxDay}
//                                                         colorScheme={{
//                                                             low: '#10b981',
//                                                             medium: '#10b981',
//                                                             high: '#10b981',
//                                                             critical: '#10b981'
//                                                         }}
//                                                         opacity={0.5}
//                                                         borderStyle="dashed"
//                                                         showLabels={false}
//                                                         zIndex={12}
//                                                     />
//                                                 );
//                                             })()}
//
//                                             {/* SDE overlay */}
//                                             {showSDEOverlay && sdeData && (() => {
//                                                 const sdeTask = sdeData.tasks.find(t => t.id === task.id);
//                                                 if (!sdeTask) return null;
//
//                                                 return (
//                                                     <GanttRenderer
//                                                         tasks={[sdeTask]}
//                                                         maxDay={unifiedMaxDay}
//                                                         colorScheme={{
//                                                             low: '#f59e0b',
//                                                             medium: '#f59e0b',
//                                                             high: '#f59e0b',
//                                                             critical: '#f59e0b'
//                                                         }}
//                                                         opacity={0.5}
//                                                         borderStyle="dashed"
//                                                         showLabels={false}
//                                                         zIndex={13}
//                                                     />
//                                                 );
//                                             })()}
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//
//                     {/* Legend */}
//                     <div style={{
//                         borderTop: '1px solid rgba(217, 119, 6, 0.3)',
//                         padding: '12px 16px',
//                         display: 'flex',
//                         flexWrap: 'wrap',
//                         gap: '16px',
//                         fontSize: '12px'
//                     }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <AlertTriangle style={{ width: '12px', height: '12px', color: '#EF4444' }} />
//                             <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Critical Path</span>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <div style={{
//                                 width: '16px',
//                                 height: '2px',
//                                 background: '#EAB308'
//                             }}></div>
//                             <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Dependencies</span>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <div style={{
//                                 width: '12px',
//                                 height: '12px',
//                                 background: '#059669',
//                                 borderRadius: '2px'
//                             }}></div>
//                             <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Low Risk</span>
//                         </div>
//                         {currentDay !== null && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 <div style={{
//                                     width: '2px',
//                                     height: '12px',
//                                     background: '#EF4444'
//                                 }}></div>
//                                 <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Today</span>
//                             </div>
//                         )}
//                         {showPdeOverlay && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 <div style={{
//                                     width: '16px',
//                                     height: '12px',
//                                     background: 'rgba(139, 92, 246, 0.5)',
//                                     border: '2px dashed rgba(139, 92, 246, 0.8)',
//                                     borderRadius: '2px'
//                                 }}></div>
//                                 <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>PDE Risk-Adjusted</span>
//                             </div>
//                         )}
//                         {showMCOverlay && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 <div style={{
//                                     width: '16px',
//                                     height: '12px',
//                                     background: 'rgba(16, 185, 129, 0.5)',
//                                     border: '2px dashed rgba(16, 185, 129, 0.8)',
//                                     borderRadius: '2px'
//                                 }}></div>
//                                 <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>Monte Carlo</span>
//                             </div>
//                         )}
//                         {showSDEOverlay && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                                 <div style={{
//                                     width: '16px',
//                                     height: '12px',
//                                     background: 'rgba(245, 158, 11, 0.5)',
//                                     border: '2px dashed rgba(245, 158, 11, 0.8)',
//                                     borderRadius: '2px'
//                                 }}></div>
//                                 <span style={{ color: 'rgba(251, 191, 36, 0.7)' }}>SDE</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//
//            {/* Hover Tooltip */}
//             {hoveredTask && (
//                 <div style={{
//                     position: 'fixed',
//                     left: `${tooltipPosition.x}px`,
//                     top: `${tooltipPosition.y}px`,
//                     transform: 'translate(-50%, -100%)',
//                     padding: '12px 16px',
//                     borderRadius: '8px',
//                     background: 'rgba(23, 15, 5, 0.95)',
//                     border: '1px solid rgba(217, 119, 6, 0.5)',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
//                     zIndex: 100,
//                     pointerEvents: 'none',
//                     minWidth: '200px'
//                 }}>
//                     <div style={{
//                         fontSize: '14px',
//                         fontWeight: 'bold',
//                         color: '#FDE68A',
//                         marginBottom: '8px'
//                     }}>
//                         {hoveredTask.name}
//                     </div>
//                     <div style={{
//                         fontSize: '12px',
//                         color: 'rgba(245, 158, 11, 0.8)',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '4px'
//                     }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <span>Duration:</span>
//                             <span style={{ color: '#FDE68A' }}>{hoveredTask.duration_days} days</span>
//                         </div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <span>Progress:</span>
//                             <span style={{ color: '#FDE68A' }}>{hoveredTask.completion_pct}%</span>
//                         </div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <span>Risk:</span>
//                             <span style={{ color: getRiskColor(hoveredTask).text }}>{hoveredTask.risk_level}</span>
//                         </div>
//                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <span>Float:</span>
//                             <span style={{ color: '#FDE68A' }}>{hoveredTask.float_days} days</span>
//                         </div>
//                         {hoveredTask.is_critical && (
//                             <div style={{
//                                 marginTop: '4px',
//                                 padding: '4px 8px',
//                                 borderRadius: '4px',
//                                 background: 'rgba(239, 68, 68, 0.2)',
//                                 border: '1px solid rgba(239, 68, 68, 0.5)',
//                                 textAlign: 'center',
//                                 color: '#FCA5A5'
//                             }}>
//                                 Critical Path
//                             </div>
//                         )}
//                     </div>
//                     <div style={{
//                         position: 'absolute',
//                         bottom: '-6px',
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         width: '12px',
//                         height: '12px',
//                         background: 'rgba(23, 15, 5, 0.95)',
//                         border: '1px solid rgba(217, 119, 6, 0.5)',
//                         borderTop: 'none',
//                         borderLeft: 'none',
//                         transform: 'translateX(-50%) rotate(45deg)'
//                     }}></div>
//                 </div>
//             )}
//
//             {/* Sliding Side Panel */}
//             <div style={{
//                 position: 'fixed',
//                 top: 0,
//                 right: 0,
//                 bottom: 0,
//                 width: window.innerWidth < 768 ? '100%' : '320px',
//                 transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
//                 transition: 'transform 0.3s ease-in-out',
//                 zIndex: 50
//             }}>
//                 <div style={{
//                     height: '100%',
//                     borderLeft: '2px solid #6b5010',
//                     background: "linear-gradient(135deg, #1a1210 0%, #2D1F1F 25%, #3a2420 50%, #2D1F1F 75%, #1a1210 100%)",
//                     boxShadow: "inset 0 1px 0 rgba(139, 105, 20, 0.15), -4px 0 16px rgba(0, 0, 0, 0.5)",
//                     overflowY: 'auto'
//                 }}>
//                     {selectedTask && (
//                         <div style={{ padding: '24px' }}>
//                             <button
//                                 onClick={closePanel}
//                                 style={{
//                                     position: 'absolute',
//                                     top: '16px',
//                                     right: '16px',
//                                     padding: '8px',
//                                     borderRadius: '8px',
//                                     background: 'rgba(23, 15, 5, 0.7)',
//                                     border: '1px solid rgba(217, 119, 6, 0.3)',
//                                     color: '#F59E0B',
//                                     cursor: 'pointer',
//                                     transition: 'background 0.2s'
//                                 }}
//                                 onMouseOver={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.9)'}
//                                 onMouseOut={(e) => e.currentTarget.style.background = 'rgba(23, 15, 5, 0.7)'}
//                             >
//                                 <X style={{ width: '20px', height: '20px' }} />
//                             </button>
//
//                             <div style={{ marginBottom: '24px' }}>
//                                 <h2 style={{
//                                     fontSize: '24px',
//                                     fontWeight: 'bold',
//                                     color: '#FDE68A',
//                                     marginBottom: '8px',
//                                     paddingRight: '40px'
//                                 }}>{selectedTask.name}</h2>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
//                                     {selectedTask.is_critical && (
//                                         <span style={{
//                                             padding: '4px 8px',
//                                             borderRadius: '9999px',
//                                             background: 'rgba(239, 68, 68, 0.2)',
//                                             border: '1px solid rgba(239, 68, 68, 0.5)',
//                                             color: '#FCA5A5',
//                                             fontSize: '12px',
//                                             fontWeight: '600',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '4px'
//                                         }}>
//                                             <AlertTriangle style={{ width: '12px', height: '12px' }} />
//                                             Critical Path
//                                         </span>
//                                     )}
//                                     <span style={{
//                                         padding: '4px 8px',
//                                         borderRadius: '9999px',
//                                         background: getRiskColor(selectedTask).bg,
//                                         opacity: 0.8,
//                                         color: 'white',
//                                         fontSize: '12px',
//                                         fontWeight: '600'
//                                     }}>
//                                         {selectedTask.risk_level} Risk
//                                     </span>
//                                 </div>
//                             </div>
//
//                             <div style={{ marginBottom: '24px' }}>
//                                 <div style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     fontSize: '14px',
//                                     color: 'rgba(201, 168, 118, 0.7)',
//                                     marginBottom: '8px'
//                                 }}>
//                                     <span>Progress</span>
//                                     <span style={{
//                                         fontWeight: '600',
//                                         color: '#FDE68A'
//                                     }}>{selectedTask.completion_pct}%</span>
//                                 </div>
//                                 <div style={{
//                                     height: '12px',
//                                     background: 'rgba(23, 15, 5, 0.5)',
//                                     borderRadius: '9999px',
//                                     overflow: 'hidden',
//                                     border: '1px solid rgba(217, 119, 6, 0.3)'
//                                 }}>
//                                     <div style={{
//                                         height: '100%',
//                                         background: getRiskColor(selectedTask).bg,
//                                         transition: 'width 0.5s',
//                                         width: `${selectedTask.completion_pct}%`
//                                     }}></div>
//                                 </div>
//                             </div>
//
//                             <div style={{
//                                 display: 'grid',
//                                 gridTemplateColumns: '1fr 1fr',
//                                 gap: '12px',
//                                 marginBottom: '24px'
//                             }}>
//                                 <div style={{
//                                     padding: '12px',
//                                     borderRadius: '8px',
//                                     background: 'rgba(23, 15, 5, 0.3)',
//                                     border: '1px solid rgba(217, 119, 6, 0.3)'
//                                 }}>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         color: 'rgba(245, 158, 11, 0.7)',
//                                         fontSize: '12px',
//                                         marginBottom: '4px'
//                                     }}>
//                                         <Timer style={{ width: '12px', height: '12px' }} />
//                                         Duration
//                                     </div>
//                                     <div style={{
//                                         fontSize: '18px',
//                                         fontWeight: 'bold',
//                                         color: '#FDE68A'
//                                     }}>{selectedTask.duration_days}d</div>
//                                 </div>
//                                 <div style={{
//                                     padding: '12px',
//                                     borderRadius: '8px',
//                                     background: 'rgba(23, 15, 5, 0.3)',
//                                     border: '1px solid rgba(217, 119, 6, 0.3)'
//                                 }}>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         color: 'rgba(245, 158, 11, 0.7)',
//                                         fontSize: '12px',
//                                         marginBottom: '4px'
//                                     }}>
//                                         <TrendingUp style={{ width: '12px', height: '12px' }} />
//                                         Float
//                                     </div>
//                                     <div style={{
//                                         fontSize: '18px',
//                                         fontWeight: 'bold',
//                                         color: '#FDE68A'
//                                     }}>{selectedTask.float_days}d</div>
//                                 </div>
//                                 <div style={{
//                                     padding: '12px',
//                                     borderRadius: '8px',
//                                     background: 'rgba(23, 15, 5, 0.3)',
//                                     border: '1px solid rgba(217, 119, 6, 0.3)'
//                                 }}>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         color: 'rgba(245, 158, 11, 0.7)',
//                                         fontSize: '12px',
//                                         marginBottom: '4px'
//                                     }}>
//                                         <Calendar style={{ width: '12px', height: '12px' }} />
//                                         Start Day
//                                     </div>
//                                     <div style={{
//                                         fontSize: '18px',
//                                         fontWeight: 'bold',
//                                         color: '#FDE68A'
//                                     }}>{selectedTask.scheduled_start_day}</div>
//                                 </div>
//                                 <div style={{
//                                     padding: '12px',
//                                     borderRadius: '8px',
//                                     background: 'rgba(23, 15, 5, 0.3)',
//                                     border: '1px solid rgba(217, 119, 6, 0.3)'
//                                 }}>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         color: 'rgba(245, 158, 11, 0.7)',
//                                         fontSize: '12px',
//                                         marginBottom: '4px'
//                                     }}>
//                                         <Calendar style={{ width: '12px', height: '12px' }} />
//                                         End Day
//                                     </div>
//                                     <div style={{
//                                         fontSize: '18px',
//                                         fontWeight: 'bold',
//                                         color: '#FDE68A'
//                                     }}>{selectedTask.scheduled_finish_day}</div>
//                                 </div>
//                             </div>
//
//                             {selectedTask.predecessors && selectedTask.predecessors.length > 0 && (
//                                 <div style={{ marginBottom: '16px' }}>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         fontSize: '14px',
//                                         color: 'rgba(201, 168, 118, 0.7)',
//                                         marginBottom: '8px'
//                                     }}>
//                                         <Link2 style={{ width: '16px', height: '16px' }} />
//                                         Depends On
//                                     </div>
//                                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
//                                         {selectedTask.predecessors.map(predId => {
//                                             const pred = projectData.tasks.find(t => t.id === predId);
//                                             return pred ? (
//                                                 <span key={predId} style={{
//                                                     padding: '4px 8px',
//                                                     borderRadius: '4px',
//                                                     background: 'rgba(23, 15, 5, 0.5)',
//                                                     border: '1px solid rgba(217, 119, 6, 0.5)',
//                                                     fontSize: '12px',
//                                                     color: '#FDE68A'
//                                                 }}>
//                                                     {pred.name}
//                                                 </span>
//                                             ) : null;
//                                         })}
//                                     </div>
//                                 </div>
//                             )}
//
//                             {selectedTask.blocks_tasks && selectedTask.blocks_tasks.length > 0 && (
//                                 <div>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '8px',
//                                         fontSize: '14px',
//                                         color: 'rgba(201, 168, 118, 0.7)',
//                                         marginBottom: '8px'
//                                     }}>
//                                         <Link2 style={{ width: '16px', height: '16px' }} />
//                                         Blocks
//                                     </div>
//                                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
//                                         {selectedTask.blocks_tasks.map(blockId => {
//                                             const blocked = projectData.tasks.find(t => t.id === blockId);
//                                             return blocked ? (
//                                                 <span key={blockId} style={{
//                                                     padding: '4px 8px',
//                                                     borderRadius: '4px',
//                                                     background: 'rgba(23, 15, 5, 0.5)',
//                                                     border: '1px solid rgba(217, 119, 6, 0.5)',
//                                                     fontSize: '12px',
//                                                     color: '#FDE68A'
//                                                 }}>
//                                                     {blocked.name}
//                                                 </span>
//                                             ) : null;
//                                         })}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//
//             {/* Backdrop */}
//             {panelOpen && (
//                 <div
//                     style={{
//                         position: 'fixed',
//                         inset: 0,
//                         background: 'rgba(0, 0, 0, 0.5)',
//                         backdropFilter: 'blur(2px)',
//                         zIndex: 40
//                     }}
//                     onClick={closePanel}
//                 ></div>
//             )}
//         </div>
//     );
// };
//
// export default GanttChart;