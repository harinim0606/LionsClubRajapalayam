const DashboardEmptyState = ({ icon, message }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <p className="text-gray-400 font-medium text-sm">{message}</p>
  </div>
);

export default DashboardEmptyState;
