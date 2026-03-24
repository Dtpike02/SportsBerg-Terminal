import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="bg-white border-b-2 border-stone-900 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & System ID */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-5 bg-amber-500" />
            <a href={"/"} className="text-lg font-bold tracking-tighter uppercase text-stone-900">Terminal_Main</a>
          </div>
          <div className="hidden md:flex items-center gap-2 px-2 py-0.5 bg-stone-100 border border-stone-300 text-[10px] text-stone-500 font-bold">
            <span className="text-amber-600">ID:</span> 8829-XQ
          </div>
        </div>

        {/* Command Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {["Dashboard", "Markets", "Screener", "Analytics"].map((item) => (
            <a
              key={item}
              href={"/" + item}
              className="text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900 hover:underline decoration-amber-500 decoration-2 underline-offset-4"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Connection Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">System_Connected</span>
          </div>
         <UserButton />
        </div>
      </div>
    </header>
  );
}