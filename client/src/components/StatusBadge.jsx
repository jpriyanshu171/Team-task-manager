const statusStyles = {
  Todo: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-amber-100 text-amber-800 ring-amber-200",
  Done: "bg-emerald-100 text-emerald-800 ring-emerald-200"
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles.Todo
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
