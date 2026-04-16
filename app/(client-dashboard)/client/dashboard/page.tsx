export default function ClientDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your client portal.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(["Invoices", "Payments", "Support Tickets", "History"] as const).map(
          (label) => (
            <div
              key={label}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold">—</p>
            </div>
          )
        )}
      </div>
      <div className="rounded-lg border border-dashed bg-card p-12 text-center text-muted-foreground">
        More features coming soon.
      </div>
    </div>
  );
}
