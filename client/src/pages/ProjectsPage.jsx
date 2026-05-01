import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  addTeamMember,
  createProject,
  deleteProject,
  getProjects,
  removeTeamMember
} from "../services/projectService.js";
import { getUsers } from "../services/userService.js";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", teamMembers: [] });
  const [memberForms, setMemberForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "Admin";

  const loadProjects = async () => {
    setError("");
    try {
      setProjects(await getProjects());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) return;

      try {
        setUsers(await getUsers());
      } catch (err) {
        setError(err.message);
      }
    };

    loadUsers();
  }, [isAdmin]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleMemberToggle = (userId) => {
    const exists = form.teamMembers.includes(userId);
    setForm({
      ...form,
      teamMembers: exists
        ? form.teamMembers.filter((id) => id !== userId)
        : [...form.teamMembers, userId]
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createProject({
        name: form.name,
        description: form.description,
        teamMembers: form.teamMembers
      });
      setForm({ name: "", description: "", teamMembers: [] });
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all related tasks?")) return;

    try {
      await deleteProject(id);
      setProjects(projects.filter((project) => project._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMemberInput = (projectId, value) => {
    setMemberForms({ ...memberForms, [projectId]: value });
  };

  const handleAddMember = async (event, projectId) => {
    event.preventDefault();
    const userId = memberForms[projectId]?.trim();
    if (!userId) return;

    try {
      await addTeamMember(projectId, userId);
      setMemberForms({ ...memberForms, [projectId]: "" });
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (projectId, userId) => {
    try {
      await removeTeamMember(projectId, userId);
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState label="Loading projects..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Projects</h2>
        <p className="mt-1 text-sm text-slate-500">Create projects and organize team members.</p>
      </div>
      <ErrorAlert message={error} />

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-4"
        >
          <label className="lg:col-span-1">
            <span className="text-sm font-medium text-slate-700">Project name</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            />
          </label>
          <label className="lg:col-span-1">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            />
          </label>
          <div className="lg:col-span-1">
            <span className="text-sm font-medium text-slate-700">Members</span>
            <div className="mt-1 max-h-32 overflow-auto rounded-md border border-slate-300 bg-white p-2">
              {users
                .filter((item) => item._id !== user?.id)
                .map((item) => (
                  <label key={item._id} className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.teamMembers.includes(item._id)}
                      onChange={() => handleMemberToggle(item._id)}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">{item.name}</span>
                      <span className="block truncate text-xs text-slate-500">{item.email}</span>
                    </span>
                  </label>
                ))}
              {users.filter((item) => item._id !== user?.id).length === 0 && (
                <p className="px-2 py-1 text-sm text-slate-500">No other users yet.</p>
              )}
            </div>
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-70"
            >
              <Plus size={16} />
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{project.description || "No description"}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(project._id)}
                  className="rounded-md border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Team</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.teamMembers.map((member) => (
                  <span
                    key={member._id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                    title={member._id}
                  >
                    {member.name}
                    {isAdmin && member._id !== project.createdBy?._id && (
                      <button
                        onClick={() => handleRemoveMember(project._id, member._id)}
                        className="font-semibold text-slate-400 hover:text-red-600"
                        title="Remove member"
                      >
                        x
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            {isAdmin && (
              <form onSubmit={(event) => handleAddMember(event, project._id)} className="mt-4 flex gap-2">
                <select
                  value={memberForms[project._id] || ""}
                  onChange={(event) => handleMemberInput(project._id, event.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                >
                  <option value="">Add team member</option>
                  {users
                    .filter((item) => !project.teamMembers.some((member) => member._id === item._id))
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.email})
                      </option>
                    ))}
                </select>
                <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  Add
                </button>
              </form>
            )}
          </article>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No projects found.
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
