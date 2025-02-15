export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-slate-300">{children}</div>;
}
