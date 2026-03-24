/**
 * COMPONENT: Footer.tsx
 * VERSION: 4.02.1 (Industrial Edition)
 * FEATURES: Dynamic Latency, Build-State tracking, Terminal Branding.
 */

"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [latency, setLatency] = useState(24);

  // Small effect to make the "System Stats" feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * (32 - 18 + 1) + 18));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-stone-100 border-t border-stone-300 mt-auto font-mono text-stone-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-10">
          
          {/* Brand/Legal Column */}
          <div className="col-span-1 md:col-span-2 space-y-5">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-3 h-3 bg-stone-900 group-hover:bg-amber-500 transition-colors" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Odds_System_LLC</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500 max-w-md italic font-medium">
              All market data is subject to a 15-minute delay unless otherwise specified. 
              The Terminal interface is a proprietary data visualization tool. 
              Unauthorized replication of data streams or automated scraping is strictly prohibited under federal data statutes.
            </p>
          </div>

          {/* System Stats Column */}
          <div className="space-y-3 bg-white/50 p-4 border border-stone-200 shadow-sm">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 border-b border-stone-200 pb-1">Network_Status</p>
            <div className="text-[11px] flex justify-between items-center">
              <span className="text-stone-500 font-bold uppercase">API_Latency</span>
              <span className="font-black text-emerald-600 tabular-nums">{latency}MS</span>
            </div>
            <div className="text-[11px] flex justify-between items-center border-t border-stone-100 pt-1">
              <span className="text-stone-500 font-bold uppercase">Node_Loc</span>
              <span className="font-black uppercase">US-EAST-1</span>
            </div>
            <div className="text-[11px] flex justify-between items-center border-t border-stone-100 pt-1">
              <span className="text-stone-500 font-bold uppercase">Uptime</span>
              <span className="font-black text-blue-600">99.982%</span>
            </div>
          </div>

          {/* Resource Column */}
          <div className="space-y-3 p-4">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 border-b border-stone-200 pb-1">Resources</p>
            <ul className="text-[11px] space-y-2 font-bold uppercase">
              <li><a href="#" className="text-stone-600 hover:text-amber-600 transition-colors flex items-center gap-2"><span>→</span> Documentation.pdf</a></li>
              <li><a href="#" className="text-stone-600 hover:text-amber-600 transition-colors flex items-center gap-2"><span>→</span> API_Endpoint_Map</a></li>
              <li><a href="#" className="text-stone-600 hover:text-amber-600 transition-colors flex items-center gap-2"><span>→</span> Terms_of_Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t-2 border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-stone-400 font-black uppercase tracking-widest flex items-center gap-4">
            <span>© 2026 ODDS_SYSTEM_TERMINAL</span>
            <span className="h-1 w-1 bg-stone-300 rounded-full" />
            <span className="text-stone-300">BUILD_V4.02.1_STABLE</span>
          </div>
          <div className="flex gap-6 text-[10px] font-black text-stone-600 uppercase tracking-tighter italic">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              NYSE: CLOSED
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              CRYPTO: ACTIVE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}