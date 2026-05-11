import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch ISS position
    const issResponse = await fetch(
      "https://api.wheretheiss.at/v1/satellites/25544",
      { next: { revalidate: 0 } } // Ensure we don't cache this too long
    );

    if (!issResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch ISS position" },
        { status: 500 }
      );
    }

    const issData = await issResponse.json();
    const { latitude, longitude } = issData;

    // 2. Fetch coordinate details (country code)
    const coordUrl = `https://api.wheretheiss.at/v1/coordinates/${latitude},${longitude}`;
    const coordResponse = await fetch(coordUrl, { next: { revalidate: 0 } });
    
    let country_code = "N/A";
    if (coordResponse.ok) {
      const coordData = await coordResponse.json();
      country_code = coordData.country_code || "N/A";
    }

    return NextResponse.json({
      latitude,
      longitude,
      country_code,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
