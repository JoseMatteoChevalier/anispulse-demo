// src/components/TestOracleCards.tsx
import React from 'react';
import { ProjectCard } from './Old_Overcomplicated_Components/projectcard2';
import { Project } from './types/index';

const TestOracleCards = () => {
  // Simple mock project
  const sampleProject: Project = {
    id: 1,
    name: "Oracle Test Project",
    tasks: [
      { id: 1, name: "Requirements", duration_days: 10, user_risk_rating: 2, predecessors: [] },
      { id: 2, name: "Design", duration_days: 15, user_risk_rating: 3, predecessors: [1] },
      { id: 3, name: "Development", duration_days: 20, user_risk_rating: 4, predecessors: [2] },
    ]
  };

  // Handlers just log actions
  const handleAction = (name: string) => (project: Project) => {
    console.log(`${name} clicked:`, project.name);
    alert(`${name}: ${project.name}`);
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: '#F4E4BC', textAlign: 'center', marginBottom: '40px' }}>
        Oracle Cards Test Page
      </h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px',
        justifyContent: 'center',
      }}>
        <div style={{ border: '2px solid yellow', width: '300px', height: '350px', padding: '10px' }}>
          <ProjectCard
            project={sampleProject}
            onViewTasks={handleAction("View Tasks")}
            onViewGantt={handleAction("View Gantt")}
            onViewAnalytics={handleAction("Analytics")}
            onEditProject={handleAction("Edit Project")}
            onSaveProject={handleAction("Save Project")}
          />
        </div>

        <div style={{ border: '2px solid yellow', width: '300px', height: '350px', padding: '10px' }}>
          <ProjectCard
            project={{ ...sampleProject, id: 2, name: "High Risk Project", tasks: sampleProject.tasks.map(t => ({ ...t, user_risk_rating: 5 })) }}
            onViewTasks={handleAction("View Tasks")}
            onViewGantt={handleAction("View Gantt")}
            onViewAnalytics={handleAction("Analytics")}
            onEditProject={handleAction("Edit Project")}
            onSaveProject={handleAction("Save Project")}
          />
        </div>
      </div>
    </div>
  );
};

export default TestOracleCards;
