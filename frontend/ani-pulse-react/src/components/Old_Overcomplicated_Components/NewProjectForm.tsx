import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';



interface Task {
  id: string;
  name: string;
  duration_days: number;
  predecessors: string[];
  user_risk_rating: number;
}

// ✅ FIXED: Updated interface to match the correct field names
interface Project {
  id?: string;
  project_name: string;
  start_date: string;
  tasks: Array<{
    id: string;
    name: string;                    // ✅ Correct field name
    duration_days: number;           // ✅ Correct field name
    predecessors: string[];          // ✅ Correct field name
    user_risk_rating: number;
  }>;
}

interface NewProjectFormProps {
  initialData?: Project | null;
  isEditing?: boolean;
  onBack: () => void;
  onSubmit: (projectData: Project) => void;
}

export function NewProjectForm({ initialData, isEditing = false, onBack, onSubmit }: NewProjectFormProps) {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: '', duration_days: 1, predecessors: [], user_risk_rating: 1 }
  ]);

  // Populate form when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setProjectName(initialData.project_name);
      setStartDate(initialData.start_date);

      // ✅ FIXED: Convert project tasks to form tasks with correct field names
      const formTasks = initialData.tasks.map((task, index) => ({
        id: task.id || (index + 1).toString(),
        name: task.name,                    // ✅ Now using correct field name
        duration_days: task.duration_days,  // ✅ Now using correct field name
        predecessors: task.predecessors || [],
        user_risk_rating: task.user_risk_rating
      }));

      setTasks(formTasks.length > 0 ? formTasks : [
        { id: '1', name: '', duration_days: 1, predecessors: [], user_risk_rating: 1 }
      ]);
    }
  }, [initialData, isEditing]);

  const addTask = () => {
    const newId = (tasks.length + 1).toString();
    setTasks([...tasks, {
      id: newId,
      name: '',
      duration_days: 1,
      predecessors: [],
      user_risk_rating: 1
    }]);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      // Reassign IDs to maintain sequence
      const reindexedTasks = updatedTasks.map((task, i) => ({
        ...task,
        id: (i + 1).toString()
      }));
      setTasks(reindexedTasks);
    }
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updatedTasks = tasks.map((task, i) => {
      if (i === index) {
        if (field === 'predecessors') {
          return { ...task, [field]: value };
        }
        return { ...task, [field]: value };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const parsePredecessors = (index: number) => {
    const task = tasks[index];
    if (typeof task.predecessors === 'string') {
      const predecessorArray = task.predecessors.split(',')
        .map(p => p.trim())
        .filter(p => p !== '' && !isNaN(parseInt(p)))
        .map(p => parseInt(p).toString());

      updateTask(index, 'predecessors', predecessorArray);
    }
  };

  // ✅ FIXED: Clean handleSubmit with correct data structure
  const handleSubmit = () => {
    if (!isFormValid) return;

    const projectData: Project = {
      ...(initialData?.id && { id: initialData.id }),
      project_name: projectName,
      start_date: startDate,
      tasks: tasks.filter(task => task.name.trim() !== '').map(task => ({
        id: task.id || `task_${Date.now()}_${Math.random()}`,
        name: task.name,
        duration_days: task.duration_days,
        predecessors: task.predecessors,
        user_risk_rating: task.user_risk_rating
      }))
    };

    console.log('📝 Form submitting data:', projectData);

    // Add data structure check for debugging
    console.log('🔍 Data structure validation:', {
      project_name: projectData.project_name,
      task_count: projectData.tasks.length,
      first_task_structure: projectData.tasks[0],
      all_tasks_have_names: projectData.tasks.every(t => t.name.trim() !== '')
    });

    onSubmit(projectData);
  };

  // ChatGPT suggestion
  const isFormValid = projectName.trim() !== '' && tasks.some(task => (task.name || '').trim() !== '');


  // const isFormValid = projectName.trim() !== '' && tasks.some(task => task.name.trim() !== '');

  return (


      <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0F0A0A 0%, #1A0E0E 25%, #2D1B1B 50%, #1A0E0E 75%, #0F0A0A 100%)',
      }}
    >
      {/* Mystical Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-4 left-4 w-16 h-16 opacity-20"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          }}
        />
        <div
          className="absolute top-4 right-4 w-16 h-16 opacity-20"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          }}
        />

        {/* Mystical energy streams */}
        <div
          className="absolute top-1/4 left-0 w-full h-px opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #CD853F 50%, #D4AF37 80%, transparent 100%)'
          }}
        />
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                color: '#C9A876',
                border: '2px solid #8B6914',
                boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
              }}
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1
                className="text-3xl mb-1"
                style={{
                  color: '#F4E4BC',
                  textShadow: '0 0 10px #D4AF3750, 0 2px 4px #00000080',
                  fontFamily: 'serif'
                }}
              >
                {isEditing ? 'Refine Your Quest' : 'Forge New Quest'}
              </h1>
              <p
                className="text-lg italic"
                style={{
                  color: '#C9A876',
                  textShadow: '0 1px 2px #00000060'
                }}
              >
                {isEditing ? 'Adjust your mystical endeavor' : 'Begin your mystical endeavor'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto relative z-10">
        <div
          className="p-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
            border: '2px solid #8B6914',
            boxShadow: 'inset 0 1px 0 #D4AF3720, 0 4px 8px #00000040'
          }}
        >
          {/* Quest Name */}
          <div className="mb-8">
            <label
              className="block text-lg mb-3"
              style={{ color: '#F4E4BC', fontFamily: 'serif' }}
            >
              Quest Name:
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-4 rounded-lg text-lg"
              style={{
                backgroundColor: '#1A0E0E',
                color: '#F4E4BC',
                border: '2px solid #8B6914',
                boxShadow: 'inset 0 2px 4px #00000040'
              }}
              placeholder="Enter your quest name..."
            />
          </div>

          {/* Start Date */}
          <div className="mb-8">
            <label className="block text-lg mb-3" style={{ color: '#F4E4BC', fontFamily: 'serif' }}>
              Quest Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-4 rounded-lg text-lg"
              style={{
                backgroundColor: '#1A0E0E',
                color: '#F4E4BC',
                border: '2px solid #8B6914',
                boxShadow: 'inset 0 2px 4px #00000040'
              }}
            />
          </div>

          {/* Sacred Tasks */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label
                className="block text-lg"
                style={{ color: '#F4E4BC', fontFamily: 'serif' }}
              >
                Sacred Tasks:
              </label>
              <button
                onClick={addTask}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 100%)',
                  color: '#F4E4BC',
                  border: '2px solid #D4AF37',
                  boxShadow: '0 2px 4px #00000040'
                }}
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: '#1A0E0E',
                    border: '1px solid #8B6914',
                    boxShadow: 'inset 0 1px 2px #00000040'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-sm"
                      style={{ color: '#C9A876' }}
                    >
                      Task {index + 1}
                    </span>
                    {tasks.length > 1 && (
                      <button
                        onClick={() => removeTask(index)}
                        className="p-1 rounded hover:bg-red-900 transition-colors"
                        style={{ color: '#C9A876' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>
                        Task Name:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter task name..."
                        value={task.name}
                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                        className="w-full p-3 rounded"
                        style={{
                          backgroundColor: '#0F0A0A',
                          color: '#F4E4BC',
                          border: '1px solid #8B6914'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>
                        Duration (Days):
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Days"
                        value={task.duration_days}
                        onChange={(e) => updateTask(index, 'duration_days', parseInt(e.target.value) || 1)}
                        className="w-full p-3 rounded"
                        style={{
                          backgroundColor: '#0F0A0A',
                          color: '#F4E4BC',
                          border: '1px solid #8B6914'
                        }}
                      />
                    </div>
                  </div>

                  {/* Dependencies */}
                  <div className="mb-4">
                    <label className="block text-sm mb-1" style={{ color: '#C9A876' }}>
                      Dependencies (Task Numbers):
                    </label>
                    <input
                      type="text"
                      placeholder="1,3,5 (comma-separated)"
                      value={Array.isArray(task.predecessors) ? task.predecessors.join(',') : task.predecessors || ''}
                      onChange={(e) => updateTask(index, 'predecessors', e.target.value)}
                      onBlur={() => parsePredecessors(index)}
                      className="w-full p-3 rounded"
                      style={{
                        backgroundColor: '#0F0A0A',
                        color: '#F4E4BC',
                        border: '1px solid #8B6914'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#C9A876' }}>
                      Risk Level: <span style={{ color: '#F4E4BC' }}>{task.user_risk_rating}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={task.user_risk_rating}
                      onChange={(e) => updateTask(index, 'user_risk_rating', parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#8B6914' }}>
                      <span>Low Risk</span>
                      <span>High Risk</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: '#8B6914',
                color: '#F4E4BC',
                border: '2px solid #D4AF37',
                boxShadow: '0 2px 4px #00000040'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isFormValid
                  ? 'linear-gradient(135deg, #4A1A4A 0%, #6B2C6B 50%, #8B3F8B 100%)'
                  : 'linear-gradient(135deg, #3A3A3A 0%, #4A4A4A 100%)',
                color: '#F4E4BC',
                border: '2px solid #D4AF37',
                boxShadow: 'inset 0 1px 0 #D4AF3740, 0 4px 8px #00000060, 0 0 20px #8B3F8B40',
                textShadow: '0 1px 2px #00000080'
              }}
            >
              {isEditing ? 'Update Quest' : 'Create Quest'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}