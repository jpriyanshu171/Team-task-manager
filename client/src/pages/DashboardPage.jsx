import { useEffect, useState } from "react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getDashboard } from "../services/dashboardService.js";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setDashboard(await getDashboard());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">A live summary of project work you can access.</p>
      </div>
      <ErrorAlert message={error} />

      {dashboard && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total tasks</p>
              <p className="mt-2 text-3xl font-semibold">{dashboard.totalTasks}</p>
            </div>
            {Object.entries(dashboard.tasksByStatus).map(([status, count]) => (
              <div key={status} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <StatusBadge status={status} />
                <p className="mt-3 text-3xl font-semibold">{count}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Overdue tasks</h3>
              <div className="mt-4 space-y-3">
                {dashboard.overdueTasks.length === 0 && (
                  <p className="text-sm text-slate-500">No overdue tasks.</p>
                )}
                {dashboard.overdueTasks.map((task) => (
                  <div key={task._id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-slate-500">{task.project?.name}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.dueDate && (
                      <p className="mt-2 text-xs text-red-600">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Assigned to me</h3>
              <div className="mt-4 space-y-3">
                {dashboard.assignedToMe.length === 0 && (
                  <p className="text-sm text-slate-500">No assigned tasks yet.</p>
                )}
                {dashboard.assignedToMe.map((task) => (
                  <div key={task._id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-slate-500">{task.project?.name}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
