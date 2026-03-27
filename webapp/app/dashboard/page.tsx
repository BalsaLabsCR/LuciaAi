import { Suspense } from "react";
import { DashboardOverview } from "../../components/dashboard-overview";

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <Suspense fallback={<section className="dashboard-shell"><h1>Cargando dashboard...</h1></section>}>
        <DashboardOverview />
      </Suspense>
    </main>
  );
}
