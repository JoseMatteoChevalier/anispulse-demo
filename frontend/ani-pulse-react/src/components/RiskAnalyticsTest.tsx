import React, { useEffect, useState } from "react";
import { RiskAnalytics } from "./RiskAnalytics";


// Known-good template that matches our Python script
const SOFTWARE_DEV_TEMPLATE = {
  id: "test-project-1",
  name: "Software Development (PDE Test)",
  description: "Test project for PDE analysis verification",
  status: "caution",
  progress: 45,
  dueDate: "2025-04-15",
  teamSize: 5,
  tasksCompleted: 2,
  totalTasks: 6,
  start_date: "2025-01-15",
  project_name: "Software Development (PDE Test)", // API expects this field
  tasks: [
    {
      id: "1",
      name: "Requirements Analysis",
      duration_days: 14,
      predecessors: [],
      user_risk_rating: 0.5
    },
    {
      id: "2",
      name: "Database Design",
      duration_days: 21,
      predecessors: ["1"],
      user_risk_rating: 1.0
    },
    {
      id: "3",
      name: "Backend API Development",
      duration_days: 28,
      predecessors: ["2"],
      user_risk_rating: 2.5
    },
    {
      id: "4",
      name: "Third-party Integration",
      duration_days: 21,
      predecessors: ["3"],
      user_risk_rating: 1.5
    },
    {
      id: "5",
      name: "Frontend UI Development",
      duration_days: 35,
      predecessors: ["2"],
      user_risk_rating: 2.0
    },
    {
      id: "6",
      name: "Testing & Deployment",
      duration_days: 14,
      predecessors: ["4", "5"],
      user_risk_rating: 1.0
    }
  ],
  subtasks: [] // Add empty subtasks to prevent errors
};

// Alternative test data for edge cases
const EDGE_CASE_TEMPLATES = {
  minimal: {
    name: "Minimal Project",
    tasks: [
      { id: "1", name: "Single Task", duration_days: 10, predecessors: [], user_risk_rating: 1 }
    ]
  },
  complex_dependencies: {
    name: "Complex Dependencies Test",
    tasks: [
      { id: "A", name: "Start", duration_days: 5, predecessors: [], user_risk_rating: 0.5 },
      { id: "B", name: "Parallel 1", duration_days: 10, predecessors: ["A"], user_risk_rating: 1.5 },
      { id: "C", name: "Parallel 2", duration_days: 8, predecessors: ["A"], user_risk_rating: 2.0 },
      { id: "D", name: "Merge", duration_days: 12, predecessors: ["B", "C"], user_risk_rating: 2.5 },
      { id: "E", name: "Final", duration_days: 6, predecessors: ["D"], user_risk_rating: 1.0 }
    ]
  }
};

// In your RiskAnalyticsTest.tsx, find the dummy RiskAnalytics function and replace it with:
function RiskAnalytics({ project, onBack }) {
  const [pdeResults, setPdeResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testPDECall = async () => {
    setLoading(true);
    try {
      console.log("🚀 Testing PDE API with project:", project);

      const response = await fetch('https://anispulse2.onrender.com/api/enhanced-pde-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: project.name,
          tasks: project.tasks
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ PDE API Success:", data);
      setPdeResults(data);

    } catch (error) {
      console.error("❌ PDE API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#1A0E0E', color: '#F4E4BC' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '10px', background: '#32CD32', color: 'white', border: 'none', borderRadius: '5px' }}>
        ← Back to Test Harness
      </button>
      <h1>Risk Analytics Component</h1>
      <p>Project: {project.name}</p>
      <p>Tasks: {project.tasks?.length || 0}</p>

      {/* ADD THIS BUTTON */}
      <button
        onClick={testPDECall}
        disabled={loading}
        style={{
          padding: '15px 30px',
          background: loading ? '#666' : '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          margin: '20px 0'
        }}
      >
        {loading ? '⏳ Testing PDE API...' : '🧪 Test PDE API Call'}
      </button>

      {/* Results display */}
      {pdeResults && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ PDE Results:</h3>
          <pre style={{
            background: '#0F0A0A',
            padding: '20px',
            fontSize: '12px',
            maxHeight: '400px',
            overflow: 'auto',
            border: '1px solid #32CD32'
          }}>
            {JSON.stringify(pdeResults, null, 2)}
          </pre>
        </div>
      )}

      <pre style={{ background: '#0F0A0A', padding: '20px', fontSize: '12px' }}>
        {JSON.stringify(project, null, 2)}
      </pre>
    </div>
  );
}

export default function RiskAnalyticsTestHarness() {
  const [selectedTemplate, setSelectedTemplate] = useState("main");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Auto-validate data shape on mount
  useEffect(() => {
    console.log("🔍 TEST HARNESS: Validating project data shape");
    validateProjectShape(SOFTWARE_DEV_TEMPLATE);
  }, []);

  const validateProjectShape = (project) => {
    const validation = {
      hasName: !!project.name,
      hasTasks: Array.isArray(project.tasks) && project.tasks.length > 0,
      tasksHaveRequiredFields: project.tasks?.every(task =>
        task.id && task.name && typeof task.duration_days === 'number' &&
        Array.isArray(task.predecessors) && typeof task.user_risk_rating === 'number'
      ),
      validRiskRatings: project.tasks?.every(task =>
        task.user_risk_rating >= 0 && task.user_risk_rating <= 5
      ),
      validPredecessors: project.tasks?.every(task =>
        task.predecessors.every(pred =>
          project.tasks.some(t => t.id === pred)
        )
      )
    };

    console.table(validation);
    setDebugInfo(validation);

    // Log detailed task info
    console.log("📋 TASKS BREAKDOWN:");
    console.table(project.tasks);

    return Object.values(validation).every(Boolean);
  };

  const getCurrentProject = () => {
    if (selectedTemplate === "main") return SOFTWARE_DEV_TEMPLATE;
    return {
      ...SOFTWARE_DEV_TEMPLATE,
      ...EDGE_CASE_TEMPLATES[selectedTemplate]
    };
  };

  if (showAnalytics) {
    return (
      <RiskAnalytics
        project={getCurrentProject()}
        onBack={() => {
          console.log("🔙 BACK: Returning to test harness");
          setShowAnalytics(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-8" style={{
      background: 'linear-gradient(135deg, #0F0A0A 0%, #1A0E0E 25%, #2D1B1B 50%, #1A0E0E 75%, #0F0A0A 100%)',
      color: '#F4E4BC'
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6" style={{
          color: '#F4E4BC',
          textShadow: '0 0 12px #D4AF3750'
        }}>
          🧪 Risk Analytics Test Harness
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Project Data Validation */}
          <div className="p-6 rounded-lg border-2" style={{
            background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
            borderColor: '#8B6914'
          }}>
            <h2 className="text-xl mb-4" style={{ color: '#D4AF37' }}>
              📊 Data Shape Validation
            </h2>

            {debugInfo && (
              <div className="space-y-2">
                {Object.entries(debugInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span style={{ color: '#C9A876' }}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <span style={{ color: value ? '#32CD32' : '#FF4444' }}>
                      {value ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => validateProjectShape(getCurrentProject())}
              className="mt-4 px-4 py-2 rounded"
              style={{
                background: '#32CD32',
                color: 'white'
              }}
            >
              🔄 Re-validate
            </button>
          </div>

          {/* Template Selector */}
          <div className="p-6 rounded-lg border-2" style={{
            background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
            borderColor: '#8B6914'
          }}>
            <h2 className="text-xl mb-4" style={{ color: '#D4AF37' }}>
              🎭 Test Templates
            </h2>

            <div className="space-y-2">
              {[
                { key: 'main', label: 'Software Dev (Main)', tasks: 6 },
                { key: 'minimal', label: 'Minimal Project', tasks: 1 },
                { key: 'complex_dependencies', label: 'Complex Dependencies', tasks: 5 }
              ].map(template => (
                <button
                  key={template.key}
                  onClick={() => {
                    setSelectedTemplate(template.key);
                    console.log(`🔄 SWITCHED TO: ${template.label}`);
                  }}
                  className="w-full text-left p-3 rounded border"
                  style={{
                    background: selectedTemplate === template.key ? '#4A1A4A' : 'transparent',
                    borderColor: selectedTemplate === template.key ? '#D4AF37' : '#8B6914',
                    color: selectedTemplate === template.key ? '#F4E4BC' : '#C9A876'
                  }}
                >
                  <div className="flex justify-between">
                    <span>{template.label}</span>
                    <span className="text-sm">{template.tasks} tasks</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Project Preview */}
        <div className="p-6 rounded-lg border-2 mb-6" style={{
          background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
          borderColor: '#8B6914'
        }}>
          <h2 className="text-xl mb-4" style={{ color: '#D4AF37' }}>
            📋 Current Project Data
          </h2>

          <div className="mb-4">
            <h3 style={{ color: '#C9A876' }}>Project: {getCurrentProject().name}</h3>
            <p style={{ color: '#8B6914' }}>Tasks: {getCurrentProject().tasks.length}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {getCurrentProject().tasks.map(task => (
              <div key={task.id} className="p-3 rounded" style={{
                background: '#1A0E0E',
                border: '1px solid #8B6914'
              }}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: '#F4E4BC' }}>{task.id}: {task.name}</span>
                  <span style={{ color: '#FFD700' }}>{task.duration_days}d</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: '#C9A876' }}>
                    Risk: {task.user_risk_rating}/5
                  </span>
                  <span style={{ color: '#8B6914' }}>
                    Deps: [{task.predecessors.join(', ') || 'none'}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Analytics Button */}
        <div className="text-center">
          <button
            onClick={() => {
              console.log("🚀 LAUNCHING: Risk Analytics with template:", selectedTemplate);
              console.log("📤 PROJECT DATA:", getCurrentProject());
              setShowAnalytics(true);
            }}
            className="px-8 py-4 rounded-lg text-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 50%, #8B3F8B 100%)',
              color: '#F4E4BC',
              border: '2px solid #D4AF37',
              boxShadow: 'inset 0 1px 0 #D4AF3740, 0 4px 8px #00000060',
              textShadow: '0 1px 2px #00000080'
            }}
          >
            🧪 Launch Risk Analytics Test
          </button>

          <p className="mt-4 text-sm" style={{ color: '#8B6914' }}>
            This will bypass all form validation and directly test the analytics component
          </p>
        </div>

        {/* Debug Console Instructions */}
        <div className="mt-8 p-4 rounded" style={{
          background: '#1A0E0E',
          border: '1px solid #8B6914'
        }}>
          <h3 className="text-sm mb-2" style={{ color: '#D4AF37' }}>
            🔧 Debug Instructions:
          </h3>
          <ul className="text-xs space-y-1" style={{ color: '#8B6914' }}>
            <li>• Open browser DevTools → Console tab</li>
            <li>• Watch for validation logs and API request/response data</li>
            <li>• Click "Launch Risk Analytics Test" to isolate the component</li>
            <li>• In analytics view, click "Run PDE Analysis" to test API call</li>
            <li>• Check console for any data shape mismatches</li>
          </ul>
        </div>
      </div>
    </div>
  );
}