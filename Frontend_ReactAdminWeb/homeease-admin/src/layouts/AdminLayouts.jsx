import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <Sidebar />

      <main
        className="
          ml-[260px]
          min-h-screen
          px-10
          py-6
        "
      >
        <Outlet />
      </main>
    </div>
  );
}