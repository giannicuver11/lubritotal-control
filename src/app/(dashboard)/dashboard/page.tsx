import {
  getDashboardKPIs,
  getDashboardCharts,
  getRecentActivity,
} from "@/lib/actions/dashboard";
import { KPICard } from "@/components/shared/kpi-card";
import {
  SalesLineChart,
  TopProductsBarChart,
  CategoryPieChart,
} from "@/components/shared/charts";
import {
  ShoppingCart,
  TrendingUp,
  Wrench,
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  Users,
} from "lucide-react";
import { formatCLP, formatDateTime } from "@/lib/utils";

function RecentActivityTable({ data }: { data: any[] }) {
  if (!Array.isArray(data)) return null;
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Actividad Reciente</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium">Fecha</th>
              <th className="pb-2 font-medium">Usuario</th>
              <th className="pb-2 font-medium">Acción</th>
              <th className="pb-2 font-medium">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Sin actividad reciente</td></tr>
            ) : data.map((item: any) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2 text-muted-foreground">{formatDateTime(item.createdAt)}</td>
                <td className="py-2">{item.user?.name || "—"}</td>
                <td className="py-2">{item.action}</td>
                <td className="py-2 text-muted-foreground">{item.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const kpis = await getDashboardKPIs();
  const charts = await getDashboardCharts();
  const recentActivity = await getRecentActivity();

  const hasError = "error" in kpis;

  const kpiList = [
    { title: "Ventas del día", value: hasError ? "—" : formatCLP(kpis.salesDay), icon: <ShoppingCart className="h-5 w-5" /> },
    { title: "Ventas del mes", value: hasError ? "—" : formatCLP(kpis.salesMonth), icon: <TrendingUp className="h-5 w-5" /> },
    { title: "Órdenes abiertas", value: hasError ? "—" : String(kpis.openOrders), icon: <Wrench className="h-5 w-5" /> },
    { title: "Valor inventario", value: hasError ? "—" : formatCLP(kpis.inventoryValue), icon: <Package className="h-5 w-5" /> },
    { title: "Stock crítico", value: hasError ? "—" : String(kpis.criticalStock), icon: <AlertTriangle className="h-5 w-5" />, variant: "warning" as const },
    { title: "Productos agotados", value: hasError ? "—" : String(kpis.outOfStock), icon: <XCircle className="h-5 w-5" />, variant: "destructive" as const },
    { title: "Utilidad estimada", value: hasError ? "—" : formatCLP(kpis.estimatedProfit), icon: <DollarSign className="h-5 w-5" /> },
    { title: "Clientes registrados", value: hasError ? "—" : String(kpis.totalClients), icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiList.map((kpi) => (
          <KPICard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} variant={"variant" in kpi ? (kpi as any).variant : undefined} />
        ))}
      </div>
      {!hasError && charts && !("error" in charts) && (
        <>
          <div className="w-full">
            <h2 className="mb-4 text-lg font-semibold">Ventas últimos 30 días</h2>
            <SalesLineChart data={charts.salesLast30Days} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-semibold">Productos más vendidos</h2>
              <TopProductsBarChart data={charts.topProducts} />
            </div>
            <div>
              <h2 className="mb-4 text-lg font-semibold">Ventas por categoría</h2>
              <CategoryPieChart data={charts.topCategories} />
            </div>
          </div>
        </>
      )}
      <RecentActivityTable data={Array.isArray(recentActivity) ? recentActivity : []} />
    </div>
  );
}

