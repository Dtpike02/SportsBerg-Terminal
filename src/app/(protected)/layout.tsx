

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen font-mono">
      
      
      <main className="flex-1 bg-[#F5F5F4]">{children}</main>
    </div>
  );
}