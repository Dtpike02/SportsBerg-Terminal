"use client";

import Footer from "@/comps/Footer";
import Header from "@/comps/Header";
import { useState, useEffect } from "react";

// Define strict interfaces for the nested Odds API data
interface Outcome {
  name: string;
  price: number;
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface OddsEvent {
  id: string;
  sport_title: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

interface ScreenedResult extends Outcome {
  event: OddsEvent;
  bookmaker: string;
}

export default function ScreenerPage() {
  const [data, setData] = useState<OddsEvent[]>([]);
  const [minPrice, setMinPrice] = useState(150);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScreener() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
        const res = await fetch(
          `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${apiKey}&regions=us&bookmakers=draftkings,fanduel,betmgm,williamhill_us,betrivers,espnbet,fanatics,hardrockbet&markets=h2h&oddsFormat=american`
        );
        const json = await res.json();
        if (Array.isArray(json)) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchScreener();
  }, []);

  // Type-safe flattening logic
  const results: ScreenedResult[] = data.flatMap((event) => 
    event.bookmakers.flatMap((book) => 
      (book.markets[0]?.outcomes || [])
        .filter((o) => o.price >= minPrice)
        .map((o) => ({ ...o, event, bookmaker: book.title }))
    )
  ).sort((a, b) => b.price - a.price);

  return (
    <div className="p-6 font-mono bg-[#F5F5F4] min-h-screen">
      <div className="bg-white border border-stone-900 p-6 mb-6">
        <h2 className="text-xs font-bold uppercase text-amber-600 mb-4">Value_Screener_v1.0</h2>
        <input 
          type="number" 
          value={minPrice} 
          onChange={(e) => setMinPrice(Number(e.target.value))}
          className="border border-stone-300 px-3 py-2 text-sm w-32 text-stone-900"
        />
      </div>

      <table className="w-full bg-white border border-stone-900 text-xs">
        <thead className="bg-stone-900 text-white uppercase text-[10px]">
          <tr>
            <th className="p-3 text-left">Event</th>
            <th className="p-3 text-left">Book</th>
            <th className="p-3 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, i) => (
            <tr key={i} className="border-b border-stone-100">
              <td className="p-3 text-stone-900">{res.event.away_team} @ {res.event.home_team}</td>
              <td className="p-3 text-stone-500">{res.bookmaker}</td>
              <td className="p-3 text-right font-bold text-emerald-700">+{res.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}