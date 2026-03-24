/**
 * PAGE: /app/analytics/page.tsx
 * VERSION: 4.0 (The "Everything" Build)
 * FEATURES: Restore Hover Tooltips, Signal Badges, Fact-Finding, and Live Timers.
 */

"use client";

import Footer from "@/comps/Footer";
import Header from "@/comps/Header";
import { useState, useEffect, useCallback } from "react";

interface Outcome { name: string; price: number; }
interface Market { key: string; outcomes: Outcome[]; }
interface Bookmaker { key: string; title: string; markets: Market[]; }
interface OddsEvent { 
  id: string; 
  sport_title: string; 
  home_team: string; 
  away_team: string; 
  commence_time: string; 
  bookmakers: Bookmaker[]; 
}
interface AnalyzedBookie { title: string; avgHold: number; }
interface Outlier { 
  event: string; 
  selection: string; 
  bookie: string; 
  price: number; 
  avgPrice: number; 
  delta: number; 
  fairPrice: string;
  edge: number; 
  startTime: Date;
}

const LEAGUES = [
  { label: "NBA", key: "basketball_nba" },
  { label: "NHL", key: "icehockey_nhl" },
  { label: "NCAAB", key: "basketball_ncaab" },
  { label: "NFL", key: "americanfootball_nfl" },
  { label: "NCAAF", key: "americanfootball_ncaaf" },
];

export default function AnalyticsPage() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0].key);
  const [bookieStats, setBookieStats] = useState<AnalyzedBookie[]>([]);
  const [outliers, setOutliers] = useState<Outlier[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>("WAITING...");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [insights, setInsights] = useState({ variance: "0.0", topValueTeam: "N/A", marketVolume: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getImpliedProb = (price: number): number => {
    if (price > 0) return 100 / (price + 100);
    const abs = Math.abs(price);
    return abs / (abs + 100);
  };

  const probToAmerican = (prob: number): string => {
    if (prob <= 0 || prob >= 1) return "N/A";
    if (prob > 0.5) return Math.round((prob / (1 - prob)) * -100).toString();
    return `+${Math.round(((1 - prob) / prob) * 100)}`;
  };

  const formatCountdown = (start: Date) => {
    const diff = start.getTime() - currentTime.getTime();
    if (diff <= 0) return "LOCKING...";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`;
  };

  const runAnalytics = useCallback(async () => {
    setLoading(true);
    try {

      const bookieKeys = "draftkings,fanduel,betmgm,williamhill_us,betrivers,espnbet,fanatics,hardrockbet";
      const res = await fetch(`/api/odds?sport=${activeLeague}&markets=h2h`);
      const events: OddsEvent[] = await res.json();

      if (!Array.isArray(events) || events.length === 0) {
        setBookieStats([]);
        setInsights({ variance: "0.0", topValueTeam: "N/A", marketVolume: 0 });
        setLastSync(new Date().toLocaleTimeString() + " (NO_DATA)");
        return;
      }

      const holdMap: Record<string, number[]> = {};
      const detectedOutliers: Outlier[] = [];
      const now = new Date();

      events.forEach((event) => {
        const startTime = new Date(event.commence_time);
        if (startTime.getTime() - now.getTime() < 60000) return; // 1-min safety

        const teamProbs: Record<string, number[]> = {};
        event.bookmakers.forEach((book) => {
          const h2h = book.markets.find((m) => m.key === "h2h");
          if (h2h && h2h.outcomes.length >= 2) {
            const sumProb = h2h.outcomes.reduce((sum, out) => sum + getImpliedProb(out.price), 0);
            if (!holdMap[book.title]) holdMap[book.title] = [];
            holdMap[book.title].push((sumProb - 1) * 100);
            h2h.outcomes.forEach(out => {
              if (!teamProbs[out.name]) teamProbs[out.name] = [];
              teamProbs[out.name].push(getImpliedProb(out.price));
            });
          }
        });

        const teamNames = Object.keys(teamProbs);
        if (teamNames.length >= 2) {
          const avgProbs: Record<string, number> = {};
          let totalAvgProb = 0;
          teamNames.forEach(name => {
            const avg = teamProbs[name].reduce((a, b) => a + b, 0) / teamProbs[name].length;
            avgProbs[name] = avg;
            totalAvgProb += avg;
          });

          event.bookmakers.forEach((book) => {
            const h2h = book.markets.find((m) => m.key === "h2h");
            h2h?.outcomes.forEach((outcome) => {
              const fairP = avgProbs[outcome.name] / totalAvgProb;
              const edge = fairP - getImpliedProb(outcome.price);

              if (edge > 0.005) { 
                detectedOutliers.push({
                  event: `${event.away_team} @ ${event.home_team}`,
                  selection: outcome.name,
                  bookie: book.title,
                  price: outcome.price,
                  avgPrice: parseInt(probToAmerican(avgProbs[outcome.name])) || 0,
                  delta: Math.abs(outcome.price - parseInt(probToAmerican(avgProbs[outcome.name]))),
                  fairPrice: probToAmerican(fairP),
                  edge: edge * 100,
                  startTime: startTime
                });
              }
            });
          });
        }
      });

      const stats = Object.keys(holdMap).map(title => ({
        title,
        avgHold: holdMap[title].reduce((a, b) => a + b, 0) / holdMap[title].length
      })).sort((a, b) => a.avgHold - b.avgHold);

      setBookieStats(stats);
      setOutliers(detectedOutliers.sort((a, b) => b.edge - a.edge).slice(0, 10));
      setInsights({
        variance: stats.length > 1 ? (Math.max(...stats.map(s => s.avgHold)) - Math.min(...stats.map(s => s.avgHold))).toFixed(2) : "0.0",
        topValueTeam: detectedOutliers[0]?.selection || "N/A",
        marketVolume: events.length
      });
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [activeLeague]);

  useEffect(() => { runAnalytics(); }, [runAnalytics]);

  return (

    <div className="p-6 font-mono bg-[#F5F5F4] min-h-screen text-stone-900">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* LEAGUE SELECTOR */}
        <div className="flex justify-between items-center bg-white border border-stone-900 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-1 overflow-x-auto">
            {LEAGUES.map((l) => (
              <button key={l.key} onClick={() => setActiveLeague(l.key)} className={`px-4 py-1 text-[10px] font-black uppercase border transition-all ${activeLeague === l.key ? "bg-stone-900 text-amber-400" : "bg-white text-stone-400 hover:border-stone-900"}`}>{l.label}</button>
            ))}
          </div>
          <button onClick={runAnalytics} className="bg-amber-500 text-stone-900 px-4 py-1 text-[10px] font-black border border-stone-900 uppercase">SYNC_FEED</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* BAR CHART WITH RESTORED HOVER */}
          <div className="lg:col-span-2 bg-white border border-stone-900 p-6 relative">
             <div className="flex justify-between items-end mb-10">
                <h2 className="text-xs font-black uppercase tracking-widest italic underline decoration-amber-500 underline-offset-4">Efficiency_Index</h2>
                <span className="text-xl font-black text-emerald-600">{(bookieStats.reduce((a,b)=>a+b.avgHold,0)/bookieStats.length || 0).toFixed(2)}% <span className="text-[10px] text-stone-400">HOLD</span></span>
             </div>
             <div className="h-32 flex items-end gap-1 border-b-2 border-l-2 border-stone-900 p-2">
                {bookieStats.map((s, i) => (
                  <div key={i} className="flex-1 group relative cursor-help">
                    {/* RESTORED HOVER TOOLTIP */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold whitespace-nowrap border border-amber-500">
                      {s.avgHold.toFixed(2)}% HOLD
                    </div>
                    <div style={{ height: `${Math.max(s.avgHold * 8, 4)}px` }} className={`w-full ${s.avgHold < 4.5 ? 'bg-emerald-500' : 'bg-stone-300'} group-hover:bg-amber-500 transition-all border-t border-x border-stone-900/10`} />
                    <span className="text-[7px] absolute top-full mt-2 rotate-45 origin-left font-black text-stone-400 uppercase">{s.title.split(' ')[0]}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* RESTORED INTEL PANEL */}
          <div className="bg-stone-900 text-white p-6 border-l-4 border-amber-500 flex flex-col justify-between shadow-xl">
             <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">Intelligence_Brief</h3>
             <div className="space-y-4 text-[11px] font-bold uppercase tracking-tighter">
                <div className="flex justify-between border-b border-stone-800 pb-2"><span>Market_Variance:</span><span className="text-amber-400">{insights.variance}%</span></div>
                <div className="flex justify-between border-b border-stone-800 pb-2"><span>Top_Value_Node:</span><span className="text-emerald-400 truncate ml-2">{insights.topValueTeam}</span></div>
                <div className="flex justify-between border-b border-stone-800 pb-2"><span>Live_Events:</span><span className="text-white">{insights.marketVolume}</span></div>
                <div className="flex justify-between border-b border-stone-800 pb-2"><span>Sync_TS:</span><span className="text-stone-500">{lastSync}</span></div>
             </div>
             <div className="mt-4 p-2 bg-stone-800 text-[8px] text-stone-500 italic uppercase">
               * High Variance &gt; 1.5% signals bookmaker disagreement.
             </div>
          </div>
        </div>

        {/* SIGNALS TABLE WITH RESTORED BADGES */}
        <div className="bg-white border border-stone-900 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-stone-900 text-amber-500 font-bold uppercase text-[9px]">
              <tr>
                <th className="p-4 text-left">T-Minus / Event</th>
                <th className="p-4 text-left">Sportsbook</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Fair</th>
                <th className="p-4 text-right">Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 italic">
              {loading ? (
                <tr><td colSpan={5} className="p-16 text-center animate-pulse text-stone-400 font-black">STREAMING_LIVE_INDICES...</td></tr>
              ) : outliers.length > 0 ? (
                outliers.map((o, i) => {
                  const isUrgent = (o.startTime.getTime() - currentTime.getTime()) < 600000;
                  return (
                    <tr key={i} className="hover:bg-amber-50/50 group transition-colors">
                      <td className="p-4 border-r border-stone-50">
                        <div className={`text-[9px] font-black mb-1 ${isUrgent ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`}>T- {formatCountdown(o.startTime)}</div>
                        <div className="font-black uppercase not-italic text-stone-900 group-hover:text-amber-600">{o.selection}</div>
                        <div className="text-[8px] text-stone-400 font-bold uppercase not-italic">{o.event}</div>
                      </td>
                      <td className="p-4 font-black text-stone-500 uppercase">{o.bookie}</td>
                      <td className="p-4 text-right font-black not-italic text-stone-900">{o.price > 0 ? `+${o.price}` : o.price}</td>
                      <td className="p-4 text-right text-stone-400 font-bold not-italic">{o.fairPrice}</td>
                      <td className="p-4 text-right">
                        {/* RESTORED SIGNAL BADGES */}
                        <span className={`px-2 py-1 text-[9px] font-black uppercase not-italic border ${
                          o.edge > 3 ? 'bg-amber-500 text-white border-amber-600' : 
                          o.edge > 1.5 ? 'bg-stone-100 text-stone-600 border-stone-300' : 
                          'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}>
                          {o.edge > 3 ? 'GOLD' : o.edge > 1.5 ? 'SILVER' : 'BRONZE'} ({o.edge.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="p-16 text-center text-stone-400 font-bold uppercase text-[10px]">Markets currently efficient for {activeLeague}. No signals detected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
}