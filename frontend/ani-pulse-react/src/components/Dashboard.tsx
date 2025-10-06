import { Plus, Search, Filter, Settings } from "lucide-react";
import { ProjectCard } from './projectcard3';
import { EditProjectForm } from './EditProjectForm';
import { Project } from './types';
import {TaskDetailView} from "./TaskDetailView";
import { useState, useEffect } from 'react';
import {RiskAnalytics} from "./RiskAnalytics";
import ReactDOM from 'react-dom';
import { ThemeToggle } from './ThemeToggle';
import GanttChart from "./CoolGaNT1";
import calculateProject from './src/api.js';

interface DashboardProps {
  // Keep it simple for now
}

// Sample projects using clean TypeScript structure
const sampleProjects: Project[] = [
        {
          name: "Website Redesign",
          tasks: [
            { id: "1", name: "UI/UX Design", duration_days: 14, predecessors: [], user_risk_rating: 1.5 },
            { id: "2", name: "Frontend Development", duration_days: 21, predecessors: ["1"], user_risk_rating: 2.0 },
            { id: "3", name: "Backend Integration", duration_days: 10, predecessors: ["2"], user_risk_rating: 1.0 },
            { id: "4", name: "Testing & QA", duration_days: 7, predecessors: ["3"], user_risk_rating: 2.5 },
          ],
          project_start_date: "2025-01-15",
         
          foundationResults: {
            success: true,
            project_name: "Website Redesign",
            project_start_date: "2025-01-15",
            analysis_mode: "baseline",
            use_business_days: false,
            calculation_timestamp: "2025-01-15T10:00:00Z",
            project_metrics: {
              total_duration_days: 52,
              overall_risk_level: "Medium",
              high_risk_task_count: 0,
              critical_path_ids: ["1", "2", "3", "4"],
              total_tasks: 4
            },
            tasks: [
              {
                id: "1",
                name: "UI/UX Design",
                duration_days: 14,
                predecessors: [],
                scheduled_start_day: 0,
                scheduled_finish_day: 14,
                actual_start_date: "2025-01-15",
                actual_end_date: "2025-01-29",
                risk_level: "Low",
                risk_score: 25,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["2"],
                blocked_by_tasks: []
              },
              {
                id: "2",
                name: "Frontend Development",
                duration_days: 21,
                predecessors: ["1"],
                scheduled_start_day: 14,
                scheduled_finish_day: 35,
                actual_start_date: "2025-01-29",
                actual_end_date: "2025-02-19",
                risk_level: "Medium",
                risk_score: 40,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["3"],
                blocked_by_tasks: ["1"]
              },
              {
                id: "3",
                name: "Backend Integration",
                duration_days: 10,
                predecessors: ["2"],
                scheduled_start_day: 35,
                scheduled_finish_day: 45,
                actual_start_date: "2025-02-19",
                actual_end_date: "2025-03-01",
                risk_level: "Low",
                risk_score: 20,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["4"],
                blocked_by_tasks: ["2"]
              },
              {
                id: "4",
                name: "Testing & QA",
                duration_days: 7,
                predecessors: ["3"],
                scheduled_start_day: 45,
                scheduled_finish_day: 52,
                actual_start_date: "2025-03-01",
                actual_end_date: "2025-03-08",
                risk_level: "Medium",
                risk_score: 45,
                is_critical: true,
                float_days: 0,
                blocks_tasks: [],
                blocked_by_tasks: ["3"]
              }
            ],
            calculation_method: "Foundation Engine v1.0",
            algorithms_used: ["CPM", "Basic Risk Analysis"],
            confidence_level: 0.85
          }
        },
        {
          name: "Mobile App Launch",
          tasks: [
            { id: "1", name: "App Architecture", duration_days: 10, predecessors: [], user_risk_rating: 1.0 },
            { id: "2", name: "Core Features", duration_days: 28, predecessors: ["1"], user_risk_rating: 3.0 },
            { id: "3", name: "API Integration", duration_days: 14, predecessors: ["2"], user_risk_rating: 2.0 },
            { id: "4", name: "Testing", duration_days: 10, predecessors: ["3"], user_risk_rating: 1.5 },
            { id: "5", name: "App Store Deploy", duration_days: 5, predecessors: ["4"], user_risk_rating: 2.5 }
          ],
          project_start_date: "2025-02-01",
          
          foundationResults: {
            success: true,
            project_name: "Mobile App Launch",
            project_start_date: "2025-02-01",
            analysis_mode: "baseline",
            use_business_days: false,
            calculation_timestamp: "2025-02-01T10:00:00Z",
            project_metrics: {
              total_duration_days: 67,
              overall_risk_level: "Medium-High",
              high_risk_task_count: 1,
              critical_path_ids: ["1", "2", "3", "4", "5"],
              total_tasks: 5
            },
            tasks: [
              {
                id: "1",
                name: "App Architecture",
                duration_days: 10,
                predecessors: [],
                scheduled_start_day: 0,
                scheduled_finish_day: 10,
                actual_start_date: "2025-02-01",
                actual_end_date: "2025-02-11",
                risk_level: "Low",
                risk_score: 20,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["2"],
                blocked_by_tasks: []
              },
              {
                id: "2",
                name: "Core Features",
                duration_days: 28,
                predecessors: ["1"],
                scheduled_start_day: 10,
                scheduled_finish_day: 38,
                actual_start_date: "2025-02-11",
                actual_end_date: "2025-03-11",
                risk_level: "High",
                risk_score: 70,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["3"],
                blocked_by_tasks: ["1"]
              },
              {
                id: "3",
                name: "API Integration",
                duration_days: 14,
                predecessors: ["2"],
                scheduled_start_day: 38,
                scheduled_finish_day: 52,
                actual_start_date: "2025-03-11",
                actual_end_date: "2025-03-25",
                risk_level: "Medium",
                risk_score: 40,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["4"],
                blocked_by_tasks: ["2"]
              },
              {
                id: "4",
                name: "Testing",
                duration_days: 10,
                predecessors: ["3"],
                scheduled_start_day: 52,
                scheduled_finish_day: 62,
                actual_start_date: "2025-03-25",
                actual_end_date: "2025-04-04",
                risk_level: "Low",
                risk_score: 25,
                is_critical: true,
                float_days: 0,
                blocks_tasks: ["5"],
                blocked_by_tasks: ["3"]
              },
              {
                id: "5",
                name: "App Store Deploy",
                duration_days: 5,
                predecessors: ["4"],
                scheduled_start_day: 62,
                scheduled_finish_day: 67,
                actual_start_date: "2025-04-04",
                actual_end_date: "2025-04-09",
                risk_level: "Medium",
                risk_score: 45,
                is_critical: true,
                float_days: 0,
                blocks_tasks: [],
                blocked_by_tasks: ["4"]
              }
            ],
            calculation_method: "Foundation Engine v1.0",
            algorithms_used: ["CPM", "Basic Risk Analysis"],
            confidence_level: 0.85
          }
        },


    {name:"Large Software Development Project",
        tasks:
                [   {id:"1",name:"Project Kickoff", completion_pct:100, user_risk_rating:1, duration_days:2, predecessors:[]},
                    {id:"2", name:"Requirements Gathering", completion_pct:80, user_risk_rating:2, duration_days:10, predecessors:["1"]},
                    {id:"3", name:"System Architecture", completion_pct:60, user_risk_rating:3, duration_days:15, predecessors:["2"]},
                    {id:"4", name:"Database Design", completion_pct:40, user_risk_rating:3, duration_days:12, predecessors:["2"]},
                    {id:"5", name:"UI/UX Design", completion_pct:50, user_risk_rating:2, duration_days:14, predecessors:["2"]},
                    {id:"6", name:"API Development", completion_pct:20, user_risk_rating:4, duration_days:20, predecessors:["3", "4"]},
                    {id:"7", name:"Frontend Development", completion_pct:10, user_risk_rating:3, duration_days:25, predecessors:["5", "6"]},
                    {id:"8", name:"Backend Development", completion_pct:15, user_risk_rating:4, duration_days:22, predecessors:["6"]},
                    {id:"9", name:"Integration Testing", completion_pct:0, user_risk_rating:3, duration_days:10, predecessors:["7", "8"]},
                    {id:"10", name:"Security Audit", completion_pct:0, user_risk_rating:5, duration_days:8, predecessors:["8"]},
                    {id:"11", name:"Performance Optimization", completion_pct:0, user_risk_rating:4, duration_days:7, predecessors:["9"]},
                    {id:"12", name:"User Acceptance Testing", completion_pct:0, user_risk_rating:2, duration_days:10, predecessors:["9", "10"]},
                    {id:"13", name:"Deployment Planning", completion_pct:0, user_risk_rating:3, duration_days:5, predecessors:["11", "12"]},
                    {id:"14", name:"Training Materials", completion_pct:0, user_risk_rating:2, duration_days:6, predecessors:["12"]},
                    {id:"15", name:"Production Deployment", completion_pct:0, user_risk_rating:5, duration_days:3, predecessors:["13", "14"]}

                ],
    project_start_date:"2025-10-13"}
];

export function Dashboard() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'taskDetail' | 'riskAnalytics'|"CoolGant1">('dashboard');
    const [projects, setProjects] = useState<Project[]>(sampleProjects || []);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSavedVersion, setLastSavedVersion] = useState<string>('');


    useEffect(() => {
        if (!editingProject || !hasUnsavedChanges) return;

        const timeoutId = setTimeout(() => {
            console.log('Auto-saving project...');
            saveProject(editingProject);
            setHasUnsavedChanges(false);
            setLastSavedVersion(JSON.stringify(editingProject));
        }, 2000); // Save after 2 seconds of inactivity

        return () => clearTimeout(timeoutId);
    }, [editingProject, hasUnsavedChanges]);

// Change detection - monitors editingProject for modifications
    useEffect(() => {
        if (!editingProject) return;

        const currentVersion = JSON.stringify(editingProject);

        if (lastSavedVersion && currentVersion !== lastSavedVersion) {
            setHasUnsavedChanges(true);
        }
    }, [editingProject, lastSavedVersion]);


    const startCreatingNewProject = () => {
        const newProject: Project = {
            id: Date.now().toString(),
            name: "New Project",
            description: "",
            tasks: [
                {id: "1", name: "Task 1", duration_days: 5, predecessors: [], user_risk_rating: 1}
            ],
            created: new Date().toISOString()
        };

        setEditingProject(newProject);
        setIsCreatingNew(true);
        setLastSavedVersion(''); // No baseline for truly new projects
        setHasUnsavedChanges(false);
    };


    const saveProject = async (project: Project) => {
        try {
            const projectData = {
                id: project.id || Date.now().toString(),
                name: project.name,
                description: project.description || "",
                project_start_date: project.project_start_date, // ← Add this lin
                tasks: project.tasks.map(task => ({
                    id: task.id,
                    name: task.name,
                    owner: task.owner,
                    duration_days: task.duration_days,
                    predecessors: task.predecessors || [],
                    user_risk_rating: task.user_risk_rating,
                    completion_pct: task.completion_pct || 0
                })),
                foundationResults: project.foundationResults || null, 
                analyticsCache: project.analyticsCache || null,  // ← VERIFY THIS LINE EXISTS
                created: project.created || new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            console.log('Sending project data:', projectData);

            const response = await fetch('https://anispulse-demo.onrender.com/api/projects', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                console.log('Project auto-saved successfully');
                loadProjects();
            } else {
                console.error('Auto-save failed with status:', response.status);
            }
        } catch (error) {
            console.error('Auto-Save failed:', error);
        }
    };


    // When starting to edit a project, set the baseline
    const startEditingProject = (project: Project) => {
        setEditingProject(project);
        setIsEditing(true);
        setLastSavedVersion(JSON.stringify(project)); // This is our clean baseline
        setHasUnsavedChanges(false);
    };


    const loadProjects = async () => {
        try {
            console.log('Loading projects from:', 'https://anispulse-demo.onrender.com/api/projects');
            const response = await fetch('https://anispulse-demo.onrender.com/api/projects');
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);
            console.log('Projects array:', data.projects);

            setProjects([...sampleProjects, ...(data.projects || [])]);

        } catch (error) {
            console.error('Load failed:', error);
            setProjects(sampleProjects);
        }
    };

// Load projects on component mount
    useEffect(() => {
        console.log('Dashboard mounted, loading projects...');
        loadProjects();
    }, []);

    const handleViewTasks = (project: Project) => {
        console.log('View tasks for:', project.name);
        setSelectedProject(project);
        setCurrentView('taskDetail')
    };

    const handleEditProject = (project: Project) => {

        console.log('=== OPENING EDIT FOR ===');
        console.log('Project to edit:', project);
        console.log('Start date should be:', project.project_start_date);
        startEditingProject(project);
        setEditingProject(project); // Modal approach


    };



    const handleProjectUpdate = (updatedProject: Project) => {
        console.log('🚨 PARENT: onProjectUpdate received. New project object:', {
            projectId: updatedProject.id,
            hasAnalyticsCache: !!updatedProject.analyticsCache,
            cacheKeys: updatedProject.analyticsCache ? Object.keys(updatedProject.analyticsCache) : [],
            hasMonteCarlo: !!updatedProject.analyticsCache?.monteCarlo,
            updatedProjectReference: updatedProject // Log the full object to check if it's new
        });
        setSelectedProject(updatedProject);
        setProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        );
      };


    const Modal = ({isOpen, onClose, children}) => {

        useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }

            // Cleanup on unmount
            return () => {
                document.body.style.overflow = '';
            };
        }, [isOpen]);

        if (!isOpen) return null;

        return ReactDOM.createPortal(
            <div
                className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto z-50 flex items-start justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="bg-[#0F172A] max-w-xl rounded-xl shadow-xl w-full max-h-[80vh] overflow-y-auto p-6">
                    {children}
                </div>
            </div>,
            document.body
        );
    };


    const handleCreateNew = () => {
        const newProject: Project = {
            name: "New Project",
            tasks: [
                {id: "1", name: "Task 1", duration_days: 5, predecessors: [], user_risk_rating: 1}
            ],
            created: new Date().toISOString()
        };
        setEditingProject(newProject);
        setIsCreatingNew(true);
        setLastSavedVersion(JSON.stringify(newProject));
        setHasUnsavedChanges(false);
    };

const handleSaveProject = async (project: Project) => {
    console.log('=== MANUAL SAVE START ===');
    console.log('Project being saved:', project);
    console.log('Start date:', project.project_start_date);

    try {
        // Call Foundation Engine to calculate baseline schedule
        console.log('Calling Foundation Engine...');
        const foundationResponse = await fetch('https://anispulse-demo.onrender.com/api/calculate-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_name: project.name,
                project_start_date: project.project_start_date || null,
                mode: "baseline",
                use_business_days: false,
                tasks: project.tasks.map(task => ({
                    id: task.id,
                    name: task.name,
                    duration_days: task.duration_days,
                    predecessors: task.predecessors || [],
                    user_risk_rating: task.user_risk_rating,
                    completion_pct: task.completion_pct || 0
                }))
            })
        });

        if (!foundationResponse.ok) {
            const errorText = await foundationResponse.text();
            throw new Error(`Foundation Engine error (${foundationResponse.status}): ${errorText}`);
        }

        const foundationData = await foundationResponse.json();
        console.log('Foundation Engine result:', foundationData);

        // Merge foundation results with project
        const enrichedProject: Project = {
            ...project,
            foundationResults: foundationData
        };

        console.log('Enriched project for MongoDB:', enrichedProject);

        // Save to MongoDB
        await saveProject(enrichedProject);

        if (isCreatingNew) {
            setIsCreatingNew(false);
        }
        setEditingProject(null);
        setHasUnsavedChanges(false);

    } catch (error) {
        console.error('Failed to process project:', error);
        alert(`Failed to calculate project schedule: ${error.message}`);
    }
};
    const handleCancel = () => {
        setSelectedProject(null);
        setIsEditing(false);
        setIsCreatingNew(false);
    };


    // In your render method
    if (currentView === 'taskDetail' && selectedProject) {
        return (
            <TaskDetailView
                project={selectedProject}
                onBack={() => setCurrentView('dashboard')}
            />
        );
    }

    if (currentView === 'riskAnalytics' && selectedProject) {
        return (
            <RiskAnalytics
                project={selectedProject}
                onBack={() => {
                    setCurrentView('dashboard');
                    setSelectedProject(null);
                  }}
                onProjectUpdate={handleProjectUpdate}
                key={selectedProject.id + (selectedProject.analyticsCache?.monteCarlo ? '-mc-cached' : '-mc-uncached')}
            />
        );
    }

    if (currentView === 'CoolGant1' && selectedProject) {
        return (
            <div style={{ minHeight: '100vh', background: '#1a1210', padding: '20px' }}>
            <GanttChart
                project={selectedProject}
                onBack={() => setCurrentView('dashboard')} // Add a back button handler
            />
            </div>
        );
    }



console.log('Direct render triggered:', isEditing && selectedProject);
console.log('Modal triggered:', !!editingProject);

    // Main dashboard view
    return (
        <div
            className="min-h-screen p-3 relative"
            style={{
                background: 'linear-gradient(135deg, #0F0A0A 0%, #1A0E0E 25%, #2D1B1B 50%, #1A0E0E 75%, #0F0A0A 100%)',
            }}
        >
            {/* Arcane Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Mystical corner ornaments */}
                {[
                    {top: "16px", left: "16px"},
                    {top: "16px", right: "16px"},
                    {bottom: "16px", left: "16px"},
                    {bottom: "16px", right: "16px"}
                ].map((position, idx) => (
                    <div
                        key={idx}
                        className="absolute w-16 h-16 opacity-20"
                        style={{
                            ...position,
                            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
                            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                        }}
                    />
                ))}

                {/* Subtle arcane energy streams */}
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
            </div>

            {/* Header */}
            <header className="max-w-7xl mx-auto mb-5 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="relative">
                        {/* Ornate title background */}
                        <div
                            className="absolute -inset-4 rounded-lg opacity-10"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #CD853F 50%, #B8860B 100%)',
                                filter: 'blur(8px)'
                            }}
                        />
                        <div className="relative">
                            <h1
                                className="text-4xl mb-2 relative"
                                style={{
                                    color: '#F4E4BC',
                                    textShadow: '0 0 10px #D4AF3750, 0 2px 4px #00000080',
                                    fontFamily: 'serif'
                                }}
                            >
                                Ani's Pulse
                                {/* Mystical underline */}
                                <div
                                    className="absolute -bottom-1 left-0 right-0 h-px"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #CD853F 50%, #D4AF37 80%, transparent 100%)'
                                    }}
                                />
                            </h1>
                            <p
                                className="text-lg italic"
                                style={{
                                    color: '#C9A876',
                                    textShadow: '0 1px 2px #00000060'
                                }}
                            >
                                Mystical Project Planner and Risk Analysis Engine
                            </p>
                        </div>
                    </div>


                    {/* Arcane Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Search Button (placeholder) */}
                        <button
                            className="p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                            style={{
                                background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                                color: '#C9A876',
                                border: '2px solid #8B6914',
                                boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
                            }}
                        >
                            <Search size={15}/>
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                                style={{background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'}}
                            />
                        </button>

                        {/* Filter Button (placeholder) */}
                        <button
                            className="p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                            style={{
                                background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                                color: '#C9A876',
                                border: '2px solid #8B6914',
                                boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
                            }}
                        >
                            <Filter size={15}/>
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                                style={{background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'}}
                            />
                        </button>

                        {/* Settings Button (placeholder) */}
                        <button
                            className="p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                            style={{
                                background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                                color: '#C9A876',
                                border: '2px solid #8B6914',
                                boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
                            }}
                        >
                            <Settings size={15}/>
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                                style={{background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'}}
                            />
                        </button>

                        <ThemeToggle />

                        {/* Create New Project Button */}
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                            style={{
                                background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 50%, #8B3F8B 100%)',
                                color: '#F4E4BC',
                                border: '2px solid #D4AF37',
                                boxShadow: 'inset 0 1px 0 #D4AF3740, 0 4px 8px #00000060, 0 0 20px #8B3F8B40',
                                textShadow: '0 1px 2px #00000080'
                            }}
                        >
                            <Plus size={15}/>
                            Forge New Quest
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                                style={{background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'}}
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* Projects Grid */}
            <main className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    {/* View Toggle (placeholder) */}
                    <div
                        className="flex rounded-lg p-1 relative"
                        style={{
                            background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                            border: '2px solid #8B6914',
                            boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
                        }}
                    >
                        {/* <button
                            className="px-4 py-2 rounded text-sm transition-all duration-200 relative"
                            style={{
                                background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                                color: '#F4E4BC',
                                textShadow: '0 1px 2px #00000080',
                                boxShadow: '0 0 10px #8B3F8B40'
                            }}
                        >
                            Arcane Grid
                        </button> */}
                        {/* <button
                            className="px-4 py-2 rounded text-sm transition-all duration-200 hover:bg-opacity-20 hover:bg-yellow-400"
                            style={{color: '#C9A876'}}
                        >
                            Scroll View
                        </button> */}
                    </div>

                    {/* Project Count Display */}
                    <div style={{color: '#C9A876'}}>
                        {projects.length} Active Quests
                    </div>
                </div>

                {/* Project Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                     style={{gridAutoRows: 'minmax(500px, auto)'}}>
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={`${project.name}-${index}`}
                            project={project}
                            onViewTasks={handleViewTasks}
                            onEditProject={handleEditProject}
                            // onViewGantt={() => console.log('Gantt view clicked')}
                            onViewGantt={(project) => {setSelectedProject(project);setCurrentView('CoolGant1');}}
                            onViewAnalytics={(project) => {
                                setSelectedProject(project);
                                setCurrentView('riskAnalytics');
                            }}
                            onSaveProject={saveProject}
                        />
                    ))}


                    {/* Add New Project Card */}
                    <div
                        onClick={handleCreateNew}
                        className="group relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[210px] flex items-center justify-center"
                        style={{
                            borderColor: '#8B6914',
                            background: 'linear-gradient(135deg, #2D1F1F10 0%, #3D2A2A10 100%)',
                            boxShadow: 'inset 0 0 20px #D4AF3710'
                        }}
                    >
                        {/* Ornate corners */}
                        {[
                            {top: "8px", left: "8px", clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)"},
                            {top: "8px", right: "8px", clipPath: "polygon(100% 0%, 100% 100%, 0% 0%)"},
                            {bottom: "8px", left: "8px", clipPath: "polygon(0% 100%, 100% 100%, 0% 0%)"},
                            {bottom: "8px", right: "8px", clipPath: "polygon(100% 100%, 0% 100%, 100% 0%)"}
                        ].map((style, idx) => (
                            <div
                                key={idx}
                                className="absolute w-6 h-6 opacity-30"
                                style={{
                                    ...style,
                                    background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'
                                }}
                            />
                        ))}

                        <div className="text-center relative z-10">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 relative"
                                style={{
                                    background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                                    border: '2px solid #D4AF37',
                                    boxShadow: '0 0 20px #8B3F8B40'
                                }}
                            >
                                <Plus size={24} style={{color: '#F4E4BC'}}/>
                                <div
                                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                                    style={{background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'}}
                                />
                            </div>
                            <p
                                className="text-xl mb-2"
                                style={{
                                    color: '#F4E4BC',
                                    textShadow: '0 1px 2px #00000080',
                                    fontFamily: 'serif'
                                }}
                            >
                                Forge New Quest
                            </p>
                            <p
                                className="text-sm italic"
                                style={{color: '#C9A876'}}
                            >
                                Begin your mystical endeavor
                            </p>
                        </div>

                        {/* Mystical glow on hover */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"
                            style={{
                                background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'
                            }}
                        />
                    </div>
                </div>
            </main>

            {/* Floating Arcane Ambiance */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Mystical energy orbs */}
                <div
                    className="absolute top-1/4 left-1/4 w-64 h-64 opacity-5 rounded-full blur-3xl animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, #D4AF37 0%, #CD853F 50%, transparent 70%)',
                        animationDuration: '4s'
                    }}
                />
                <div
                    className="absolute bottom-1/3 right-1/4 w-80 h-80 opacity-5 rounded-full blur-3xl animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, #8B3F8B 0%, #6B2C6B 50%, transparent 70%)',
                        animationDuration: '6s',
                        animationDelay: '2s'
                    }}
                />
                <div
                    className="absolute top-2/3 right-2/3 w-48 h-48 opacity-5 rounded-full blur-3xl animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, #CD853F 0%, #B8860B 50%, transparent 70%)',
                        animationDuration: '5s',
                        animationDelay: '1s'
                    }}
                />
            </div>

            <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)}>
    {editingProject && (
        <EditProjectForm
            initialData={editingProject}
            onSubmit={(project) => {
                handleSaveProject(project);
                setEditingProject(null);
            }}
            onCancel={() => setEditingProject(null)}
            onDelete={(projectId) => {
                setProjects(projects.filter(p => p.id !== projectId));
                loadProjects();
            }}
        />
    )}
</Modal>


        </div>
    );
}
