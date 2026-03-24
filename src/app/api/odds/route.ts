import { NextRequest, NextResponse } from "next/server";

const US_BOOKMAKERS = [
  "fanduel",
  "draftkings",
  "betmgm",
  "williamhill_us",
  "betrivers",
  "espnbet",
  "fanatics",
  "hardrockbet",
].join(",");

const API_KEY = process.env.ODDS_API_KEY; // ← no NEXT_PUBLIC_

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sport = searchParams.get("sport") ?? "basketball_nba";
  const endpoint = searchParams.get("endpoint") ?? "odds";

  let url: string;

  if (endpoint === "sports") {
    // Markets page: list all sports
    url = `https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`;
  } else if (endpoint === "screener") {
    // Screener page: upcoming odds across all sports
    url = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${API_KEY}&regions=us&bookmakers=${US_BOOKMAKERS}&markets=h2h&oddsFormat=american`;
  } else {
    // Default: odds for a specific sport (used by Odds + Analytics pages)
    const markets = searchParams.get("markets") ?? "h2h,spreads,totals";
    url = `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${API_KEY}&regions=us&markets=${markets}&oddsFormat=american&bookmakers=${US_BOOKMAKERS}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch odds" }, { status: 500 });
  }
}