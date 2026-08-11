export default function ProviderTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="flex gap-10 border-b mb-8">

      <button
        onClick={() =>
          setActiveTab("pending")
        }
        className={`pb-3 font-medium ${
          activeTab === "pending"
            ? "text-teal-700 border-b-2 border-teal-700"
            : "text-gray-500"
        }`}
      >
        Pending Approval
      </button>

      <button
        onClick={() =>
          setActiveTab("approved")
        }
        className={`pb-3 font-medium ${
          activeTab === "approved"
            ? "text-teal-700 border-b-2 border-teal-700"
            : "text-gray-500"
        }`}
      >
        Approved
      </button>

    </div>
  );
}
