import { useState } from "react";
import { X, Plus, Save, Calendar, User } from "lucide-react";
// From the EditProjectForm file, the types folder is two levels up
import { Project, validateProject, validateDependencies } from "./types/index";

interface EditProjectFormProps {
  initialData: Project;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  onDelete?: (projectId: string) => void;
}

export function EditProjectForm({ initialData, onSubmit, onCancel, onDelete }: EditProjectFormProps) {
  const [project, setProject] = useState<Project>({ ...initialData });
  const [errors, setErrors] = useState<string[]>([]);
  const [dependencyInputs, setDependencyInputs] = useState<string[]>(
    initialData.tasks.map(task => (task.predecessors || []).join(", "))
  );

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProject({ ...project, name: e.target.value });
  };

  const handleProjectStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProject({ ...project, project_start_date: e.target.value });
  };

  const handleTaskChange = (
    index: number,
    field: keyof Project["tasks"][0],
    value: string | number | string[]
  ) => {
    const updatedTasks = [...project.tasks];
    if (field === "predecessors") {
      // Update the input state to preserve what user typed
      const newInputs = [...dependencyInputs];
      newInputs[index] = value as string;
      setDependencyInputs(newInputs);

      // Parse for the actual project state
      const parsedIds = typeof value === 'string'
        ? value.split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id !== "")
        : value;
      updatedTasks[index][field] = parsedIds;
    } else {
      updatedTasks[index][field] = value;
    }

    setProject({ ...project, tasks: updatedTasks });
  };

  const addTask = () => {
    setProject({
      ...project,
      tasks: [
        ...project.tasks,
        {
          id: `${project.tasks.length + 1}`,
          name: `Task ${project.tasks.length + 1}`,
          duration_days: 1,
          predecessors: [],
          user_risk_rating: 0,
          owner: "", // Initialize with empty owner
        },
      ],
    });
    // Add empty dependency input for new task
    setDependencyInputs([...dependencyInputs, ""]);
  };

  const removeTask = (index: number) => {
    const updatedTasks = project.tasks.filter((_, i) => i !== index);
    setProject({ ...project, tasks: updatedTasks });
    // Remove corresponding dependency input
    const updatedInputs = dependencyInputs.filter((_, i) => i !== index);
    setDependencyInputs(updatedInputs);
  };

  const validateForm = (): boolean => {
    if (!validateProject(project)) {
      setErrors(["Invalid project data. Ensure all fields are filled correctly."]);
      return false;
    }
    const { valid, errors: depErrors } = validateDependencies(project);
    if (!valid) {
      setErrors(depErrors);
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleSubmit = async () => {
      console.log('Submitting project:', project);
      console.log('Task IDs:', project.tasks.map(t => t.id));
      console.log('Task dependencies:', project.tasks.map(t => ({ id: t.id, deps: t.predecessors })));
      if (!validateForm()) return;
        onSubmit(project);
    }

  const handleDelete = async () => {
    if (!project.id) {
      alert("Cannot delete project: No project ID found");
      return;
    }

    const confirmMessage = `Delete "${project.name}" permanently?\n\nThis action cannot be undone.`;

    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`https://anispulse-demo.onrender.com/api/projects/${project.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          console.log('Project deleted successfully');
          if (onDelete) {
            onDelete(project.id);
          }
          onCancel(); // Close the form
        } else {
          const errorData = await response.json();
          alert(`Failed to delete project: ${errorData.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  return (
    <div
      className="relative max-w-4xl mx-auto p-6 rounded-lg"
      style={{
        background: "linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 25%, #4A3131 50%, #3D2A2A 75%, #2D1F1F 100%)",
        border: "2px solid #8B6914",
        boxShadow: "inset 0 1px 0 #D4AF3720, 0 4px 8px #00000060",
      }}
    >
      {/* Ornate corners */}
      {[
        { top: "2px", left: "2px", clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)" },
        { top: "2px", right: "2px", clipPath: "polygon(100% 0%, 100% 100%, 0% 0%)" },
        { bottom: "2px", left: "2px", clipPath: "polygon(0% 100%, 100% 100%, 0% 0%)" },
        { bottom: "2px", right: "2px", clipPath: "polygon(100% 100%, 0% 100%, 100% 0%)" },
      ].map((style, idx) => (
        <div
          key={idx}
          className="absolute w-6 h-6 opacity-30"
          style={{ ...style, background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
        />
      ))}

      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl"
          style={{
            color: "#F4E4BC",
            textShadow: "0 0 10px #D4AF3750, 0 2px 4px #00000080",
            fontFamily: "serif",
          }}
        >
          Edit Arcane Quest
        </h2>
        <div
          className="w-24 h-px mx-auto my-4"
          style={{ background: "linear-gradient(90deg, transparent 0%, #CD853F 50%, transparent 100%)" }}
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div
          className="mb-6 p-4 rounded-lg"
          style={{ background: "#DC143C20", border: "1px solid #DC143C60", color: "#F4E4BC" }}
        >
          {errors.map((error, idx) => (
            <p key={idx}>{error}</p>
          ))}
        </div>
      )}

      {/* Project Name and Start Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: "#C9A876", fontFamily: "serif" }}
          >
            <Calendar size={16} className="inline mr-2" />
            Project Name
          </label>
          <input
            type="text"
            value={project.name}
            onChange={handleProjectNameChange}
            className="w-full p-3 rounded-lg"
            style={{
              background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
              border: "1px solid #8B691440",
              color: "#F4E4BC",
              boxShadow: "inset 0 1px 0 #D4AF3720",
            }}
          />
        </div>
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: "#C9A876", fontFamily: "serif" }}
          >
            <Calendar size={16} className="inline mr-2" />
            Start Date
          </label>
          <input
            type="date"
            value={project.project_start_date || ""}
            onChange={handleProjectStartDateChange}
            className="w-full p-3 rounded-lg"
            style={{
              background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
              border: "1px solid #8B691440",
              color: "#F4E4BC",
              boxShadow: "inset 0 1px 0 #D4AF3720",
              colorScheme: "dark", // Makes date picker work better with dark theme
            }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label
            className="block text-sm"
            style={{ color: "#C9A876", fontFamily: "serif" }}
          >
            Tasks
          </label>
          <button
            onClick={addTask}
            className="p-2 rounded-lg"
            style={{
              background: "linear-gradient(135deg, #4A1A4A, #6B2C6B)",
              color: "#D4AF37",
              border: "1px solid #D4AF37",
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        {project.tasks.map((task, index) => (
          <div
            key={task.id}
            className="mb-4 p-4 rounded-lg relative"
            style={{
              background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
              border: "1px solid #8B691440",
            }}
          >
            <button
              onClick={() => removeTask(index)}
              className="absolute top-2 right-2"
              style={{ color: "#DC143C" }}
            >
              <X size={16} />
            </button>
            {/* Task ID Header */}
            <div className="px-3 py-2 rounded text-center font-mono font-bold mb-4" style={{
               background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
               color: "#D4AF37",
               border: "1px solid #8B691440",
              minWidth: "50px",
              fontSize: "14px"}}>
                Task ID :: #{index + 1}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#C9A876" }}
                >
                  Task Name
                </label>
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => handleTaskChange(index, "name", e.target.value)}
                  className="w-full p-2 rounded"
                  style={{
                    background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                    border: "1px solid #8B691440",
                    color: "#F4E4BC",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#C9A876" }}
                >
                  <User size={14} className="inline mr-1" />
                  Task Owner
                </label>
                <input
                  type="text"
                  value={task.owner || ""}
                  onChange={(e) => handleTaskChange(index, "owner", e.target.value)}
                  placeholder="Assign to..."
                  className="w-full p-2 rounded"
                  style={{
                    background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                    border: "1px solid #8B691440",
                    color: "#F4E4BC",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#C9A876" }}
                >
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={task.duration_days}
                  onChange={(e) => handleTaskChange(index, "duration_days", Number(e.target.value))}
                  min="1"
                  className="w-full p-2 rounded"
                  style={{
                    background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                    border: "1px solid #8B691440",
                    color: "#F4E4BC",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#C9A876" }}
                >
                  Risk Rating (0-5)
                </label>
                <input
                  type="number"
                  value={task.user_risk_rating}
                  onChange={(e) => handleTaskChange(index, "user_risk_rating", Number(e.target.value))}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full p-2 rounded"
                  style={{
                    background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                    border: "1px solid #8B691440",
                    color: "#F4E4BC",
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#C9A876" }}
                >
                  Dependencies (comma-separated task IDs)
                </label>
                <input
                  type="text"
                  value={dependencyInputs[index] || ""}
                  onChange={(e) => handleTaskChange(index, "predecessors", e.target.value)}
                  placeholder="e.g., 1,2"
                  className="w-full p-2 rounded"
                  style={{
                    background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
                    border: "1px solid #8B691440",
                    color: "#F4E4BC",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #4A1A4A, #6B2C6B)",
            color: "#D4AF37",
            border: "2px solid #D4AF37",
            boxShadow: "0 0 12px #8B3F8B40",
          }}
        >
          <Save size={16} className="inline mr-2" />
          Save Quest
        </button>

        {project.id && (
          <button
            onClick={handleDelete}
            className="px-6 py-3 rounded-lg"
            style={{
              background: "linear-gradient(135deg, #8B0000, #DC143C)",
              color: "#F4E4BC",
              border: "2px solid #DC143C",
              boxShadow: "0 0 12px #DC143C40",
            }}
          >
            <X size={16} className="inline mr-2" />
            Delete
          </button>
        )}

        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #2D1F1F, #3D2A2A)",
            color: "#C9A876",
            border: "2px solid #8B6914",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}