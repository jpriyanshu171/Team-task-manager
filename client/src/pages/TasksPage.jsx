import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getProjects } from "../services/projectService.js";
import { createTask, deleteTask, getTasks, updateTask } from "../services/taskService.js";

const initialForm = {
  title: "",
  description: "",
  status: "Todo",
  project: "",
  assignedTo: "",
  dueDate: ""
};

const statuses = ["Todo", "In Progress", "Done"];

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ project: "", status: "" });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.project),
    [projects, form.project]
  );

  const loadData = async () => {
    setError("");
    try {
      const params = {};
      if (filters.project) params.project = filters.project;
      if (filters.status) params.status = filters.status;

      const [projectData, taskData] = await Promise.all([getProjects(), getTasks(params)]);
      setProjects(projectData);
      setTasks(taskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.project, filters.status]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };

    if (name === "project") {
      nextForm.assignedTo = "";
    }

    setForm(nextForm);
  };

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createTask({
        ...form,
        dueDate: form.dueDate || undefined
      });
      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const updated = await updateTask(taskId, { status });
      setTasks(tasks.map((task) => (task._id === taskId ? updated : task)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState label="Loading tasks..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <p className="mt-1 text-sm text-slate-500">Assign work and update progress by status.</p>
      </div>
      <ErrorAlert message={error} />

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-6"
      >
        <label className="lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleFormChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
        </label>
        <label className="lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Project</span>
          <select
            name="project"
            required
            value={form.project}
            onChange={handleFormChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Assignee</span>
          <select
            name="assignedTo"
            required
            value={form.assignedTo}
            onChange={handleFormChange}
            disabled={!selectedProject}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 disabled:bg-slate-100"
          >
            <option value="">Select user</option>
            {selectedProject?.teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Due date</span>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleFormChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
        </label>
        <label className="lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            name="status"
            value={form.status}
            onChange={handleFormChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end lg:col-span-3">
          <button
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-70"
          >
            <Plus size={16} />
            {saving ? "Creating..." : "Create task"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <select
          name="project"
          value={filters.project}
          onChange={handleFilterChange}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article key={task._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{task.project?.name}</p>
              </div>
              <button
                onClick={() => handleDelete(task._id)}
                className="rounded-md border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">{task.description || "No description"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                {task.assignedTo?.name}
              </span>
              {task.dueDate && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <select
              value={task.status}
              onChange={(event) => handleStatusChange(task._id, event.target.value)}
              className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </article>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No tasks found.
        </div>
      )}
    </div>
  );
};

export default TasksPage;
