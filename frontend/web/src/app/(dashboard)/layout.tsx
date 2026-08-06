import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}