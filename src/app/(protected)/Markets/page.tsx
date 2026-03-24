"use client";

import Footer from "@/comps/Footer";
import Header from "@/comps/Header";
import { useState, useEffect } from "react";

interface Sport {
  key: string;
  active: boolean;
  group: string;
  title: string;
  description: string;
  has_outrights: boolean;
}

export default function MarketsPage() {
  const [sports, setSports] = useState<Sport[]>([]); // Initialized as empty array
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSports() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
        const res = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`);
        const data = await res.json();
        
        // Safety check: The Odds API sometimes returns an object with an 'message' key on error
        if (Array.isArray(data)) {
          setSports(data);
        } else {
          setError(data.message || "Failed to load markets");
        }
      } catch (err) {
        setError("Network connection failed");
      } finally {
        setLoading(false);
      }
    }
    fetchSports();
  }, []);

  // Use optional chaining or a fallback array to prevent the .filter error
  const filtered = (Array.isArray(sports) ? sports : []).filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.group.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="p-6 font-mono bg-[#F5F5F4] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end border-b-2 border-stone-900 pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-stone-900">System.Directory_Markets</h1>
          <input 
            type="text"
            placeholder="SEARCH_MARKET..."
            className="bg-white border border-stone-900 text-stone-900 px-3 py-1 text-xs outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="text-red-600 text-xs mb-4">ERROR: {error}</div>}

        {loading ? (
          <div className="text-xs animate-pulse">SYNCING...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
            {filtered.map((sport) => (
              <div key={sport.key} className="bg-white border border-stone-300 p-3 hover:bg-[#FFFBEA]">
                <span className="text-[9px] bg-stone-500 text-white px-1 font-bold">{sport.group}</span>
                <h3 className="text-sm font-bold uppercase truncate mt-1 text-stone-900">{sport.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
}