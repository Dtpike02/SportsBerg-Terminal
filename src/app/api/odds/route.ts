// app/api/odds/route.ts
import { NextRequest, NextResponse } from "next/server";

const US_BOOKMAKERS = [
  "fanduel",
  "draftkings",
  "betmgm",
  "caesars",
  "pointsbetus",
  "betrivers",
  "espnbet",
  "hardrock",
].join(",");

export async function GET(req: NextRequest) {
  const sport = req.nextUrl.searchParams.get("sport") ?? "basketball_nba";
  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=${US_BOOKMAKERS}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}