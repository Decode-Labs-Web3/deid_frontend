import { Sidebar } from "@/components/layout/Sidebar";

const OriginTask = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-52">
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Origin Task</h1>
          <p className="text-muted-foreground">
            This page is under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OriginTask;
