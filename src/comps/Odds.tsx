"use client";

import { useState, useEffect, Fragment } from "react";

type Outcome = {
  name: string;
  price: number;
  point?: number;
};
type Market = {
  key: string;
  last_update: string;
  outcomes: Outcome[];
};
type Bookmaker = {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
};
type OddEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
};

const SPORTS = [
  { label: "NBA", key: "basketball_nba" },
  { label: "NFL", key: "americanfootball_nfl" },
  { label: "NHL", key: "icehockey_nhl" },
  { label: "NCAA Basketball", key: "basketball_ncaab" },
  { label: "NCAA Football", key: "americanfootball_ncaaf" },
];

function formatOdds(price: number) {
  return price > 0 ? `+${price}` : `${price}`;
}

function getBestPrice(event: OddEvent, team: string, marketKey: string): number | null {
  let best: number | null = null;

  // Determine the correct name to look for in the data (Fix from Turn 3)
  const lookupName = marketKey === "totals" 
    ? (team === event.away_team ? "Over" : "Under") 
    : team;

  for (const book of event.bookmakers) {
    const market = book.markets.find((m) => m.key === marketKey);
    const outcome = market?.outcomes.find((o) => o.name === lookupName);
    if (outcome != null) {
      if (best === null || outcome.price > best) best = outcome.price;
    }
  }
  return best;
}

function OddsCell({ market, team, isBest }: { market?: Market; team: string; isBest: boolean }) {
  const outcome = market?.outcomes.find((o) => o.name === team);
  
  if (!outcome) {
    return (
      <td className="px-3 py-2 text-right border-l border-stone-300">
        <span className="text-stone-400 text-sm">—</span>
      </td>
    );
  }

  return (
    // Conditional styling for cell background if it has the best price
    <td className={`px-3 py-2 text-right border-l border-stone-300 ${isBest ? "bg-[#FFF4D6]" : ""}`}>
      <div className="flex flex-col items-end">
        <span className={`text-sm tabular-nums font-bold ${isBest ? "text-amber-900" : "text-stone-900"}`}>
          {isBest && <span className="mr-1 text-[10px]">▶</span>}
          {formatOdds(outcome.price)}
        </span>
        {outcome.point !== undefined && (
          <span className="text-[11px] text-stone-500 tabular-nums">
            {outcome.point > 0 ? "+" : ""}{outcome.point}
          </span>
        )}
      </div>
    </td>
  );
}

function BestOddsSummary({ event }: { event: OddEvent }) {
  const teams = [event.away_team, event.home_team];
  const markets = [
    { key: "h2h", label: "MONEYLINE" },
    { key: "spreads", label: "SPREAD" },
    { key: "totals", label: "TOTAL" },
  ];

  return (
    <div className="border-b-2 border-stone-900 bg-[#FFFBEA] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 bg-amber-500"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-900">
          Aggregate Best Odds
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6 border-t border-amber-200 pt-3">
        {markets.map((mk) => (
          <div key={mk.key} className="border-r border-amber-200 last:border-r-0 pr-6">
            <p className="text-[11px] uppercase tracking-wider text-amber-700 mb-2 font-bold">{mk.label}</p>
            <div className="space-y-1.5">
              {teams.map((team) => {
                // Determine lookup name (Fix from Turn 3)
                const lookupName = mk.key === "totals" 
                  ? (team === event.away_team ? "Over" : "Under") 
                  : team;

                const best = getBestPrice(event, team, mk.key);
                if (best === null) return null;

                // Find bookmakers with best odds using the correct lookupName (Fix from Turn 4)
                const bestBooks = event.bookmakers.filter((book) => {
                  const market = book.markets.find((m) => m.key === mk.key);
                  return market?.outcomes.find((o) => o.name === lookupName)?.price === best;
                });

                return (
                  <div key={team} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-800 truncate mr-2 font-medium">
                        {/* Clearer labels for totals */}
                        {mk.key === "totals" ? (team === event.away_team ? "Over" : "Under") : team.split(" ").pop()}
                      </span>
                      <span className="text-sm font-bold text-amber-900 tabular-nums">
                        {formatOdds(best)}
                      </span>
                    </div>
                    {/* Displaying bookmakers correctly for totals (Fix from Turn 4) */}
                    <span className="text-[10px] text-amber-600 text-right uppercase tracking-tighter">
                      [{bestBooks.map((b) => b.title.substring(0, 10)).join(", ")}]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Odds() {
  const [selectedSport, setSelectedSport] = useState(SPORTS[0].key);
  const [data, setData] = useState<OddEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBestOdds, setShowBestOdds] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" }));
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchOdds() {
      setLoading(true);
      try {
        const res = await fetch(`/api/odds?sport=${selectedSport}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOdds();
  }, [selectedSport]);

  const marketKeys = [
    { key: "h2h", label: "MONEYLINE" },
    { key: "spreads", label: "SPREAD" },
    { key: "totals", label: "TOTAL" }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-stone-900 font-mono selection:bg-amber-200">
      
      {/* Top Main Navigation Bar */}
      <div className="bg-white border-b-2 border-stone-900 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-amber-500 animate-pulse" />
            <span className="text-base font-bold uppercase tracking-widest text-stone-900">
              Odds Terminal
            </span>
          </div>
          <span className="text-stone-300">|</span>
          <span className="text-sm text-stone-700 uppercase tracking-widest bg-stone-100 px-2 py-0.5 border border-stone-300">
            {SPORTS.find((s) => s.key === selectedSport)?.label}
          </span>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <span className="text-sm font-bold text-stone-800 tabular-nums hidden sm:inline">
            {currentTime}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={showBestOdds} 
              onChange={() => setShowBestOdds(!showBestOdds)} 
              className="accent-stone-900 w-4 h-4 cursor-pointer rounded-none"
            />
            <span className="text-xs uppercase tracking-widest text-stone-600 group-hover:text-stone-900 font-bold">
              Best Odds
            </span>
          </label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="bg-white border border-stone-900 rounded-none px-3 py-1.5 text-sm text-stone-900 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
          >
            {SPORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-header Data Ribbon */}
      <div className="bg-stone-100 border-b border-stone-300 px-6 py-2">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Market Overview: {data.length} Games Found · US Markets · American Odds
        </p>
      </div>

      {/* Content Feed */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-1 text-stone-400 text-sm">
            Fetching Market Data<span className="animate-pulse">...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="border border-stone-300 bg-white p-8 text-center text-stone-500 text-sm uppercase tracking-widest">
            No active games found for this query.
          </div>
        ) : (
          // Applying alternating card backgrounds here (index % 2) for game separation
          data.map((event, index) => (
            <div key={event.id} className={`border border-stone-400 shadow-sm rounded-none ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
              
              {/* Game Header Bar */}
              <div className="bg-stone-900 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between text-white border-b-4 border-amber-500">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                    {event.sport_title}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide flex items-center gap-3">
                    <span className="text-stone-300">{event.away_team}</span>
                    <span className="text-stone-500 font-normal text-sm">AT</span>
                    <span className="text-white">{event.home_team}</span>
                  </h2>
                </div>
                <p className="text-xs text-stone-400 tabular-nums uppercase mt-2 md:mt-0 font-medium tracking-wider">
                  {new Date(event.commence_time).toLocaleString(undefined, { 
                    weekday: 'short', month: 'short', day: 'numeric', hour: "numeric", minute: "2-digit" 
                  })}
                </p>
              </div>

              {/* Highlight Ribbon - Summary has distinct background */}
              {showBestOdds && <BestOddsSummary event={event} />}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-300">
                      <th className="text-left font-semibold py-2 px-4 text-stone-600 uppercase tracking-wider w-48">Sportsbook</th>
                      {marketKeys.map(mk => (
                        <th key={mk.key} colSpan={2} className="text-center font-bold py-2 px-3 border-l border-stone-300 text-stone-800 uppercase tracking-widest text-xs bg-stone-200">
                          {mk.label}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-stone-50 border-b-2 border-stone-300 text-xs text-stone-500">
                      <th></th>
                      {/* Sub-headers for each market (Away / Home) */}
                      {marketKeys.map(mk => (
                        <Fragment key={`${mk.key}-headers`}>
                          <th className="border-l border-stone-300 px-3 py-1.5 font-semibold text-right truncate max-w-[100px]">{event.away_team.split(" ").pop()}</th>
                          <th className="border-l border-stone-200 px-3 py-1.5 font-semibold text-right truncate max-w-[100px]">{event.home_team.split(" ").pop()}</th>
                        </Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {event.bookmakers.map((book) => (
                      // Applying zebra stripping here (even:bg-stone-100)
                      <tr key={book.key} className="transition-colors hover:bg-amber-50 even:bg-stone-100 odd:bg-white">
                        <td className="py-3 px-4 font-bold text-stone-800 uppercase tracking-tight text-xs">
                          {book.title}
                        </td>
                        
                        {marketKeys.map(mk => {
                          const market = book.markets.find(m => m.key === mk.key);
                          
                          // Correct lookup logic (Fix from Turn 3)
                          const awayLookup = mk.key === "totals" ? "Over" : event.away_team;
                          const homeLookup = mk.key === "totals" ? "Under" : event.home_team;

                          const bestAway = getBestPrice(event, event.away_team, mk.key);
                          const bestHome = getBestPrice(event, event.home_team, mk.key);
                          
                          const currentAwayPrice = market?.outcomes.find(o => o.name === awayLookup)?.price;
                          const currentHomePrice = market?.outcomes.find(o => o.name === homeLookup)?.price;

                          return (
                            <Fragment key={mk.key}>
                              <OddsCell 
                                market={market} 
                                team={awayLookup} // Pass correct lookup name ("Over")
                                isBest={currentAwayPrice === bestAway && bestAway !== null} 
                              />
                              <OddsCell 
                                market={market} 
                                team={homeLookup} // Pass correct lookup name ("Under")
                                isBest={currentHomePrice === bestHome && bestHome !== null} 
                              />
                            </Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}