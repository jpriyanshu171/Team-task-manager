const LoadingState = ({ label = "Loading..." }) => {
  return <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">{label}</div>;
};

export default LoadingState;
