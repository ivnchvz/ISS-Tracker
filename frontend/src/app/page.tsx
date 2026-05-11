"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StarsBackground } from "../components/ui/stars-background"; // Already added

interface GlobeProps {
  issLatitude: number;
  issLongitude: number;
  globeConfig?: {
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    globeColor?: string;
    emissive?: string;
    emissiveIntensity?: number;
    shininess?: number;
  };
}

const Globe = dynamic<GlobeProps>(
  () => import("../components/ui/globe").then((mod) => mod.Globe),
  { ssr: false }
);

interface IssUpdateData {
  latitude: number;
  longitude: number;
  country_code?: string;
  error?: string;
}

export default function Home() {
  const [issPosition, setIssPosition] = useState<{
    latitude: number;
    longitude: number;
    countryCode?: string;
  }>({
    latitude: 0,
    longitude: 0,
    countryCode: "N/A",
  });

  const fetchIssData = async () => {
    try {
      const response = await fetch("/api/iss");
      const data: IssUpdateData = await response.json();
      
      if (data && !data.error) {
        setIssPosition({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          countryCode: data.country_code || "N/A",
        });
      } else if (data.error) {
        console.error("API error:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchIssData();

    // Set up polling every 2 seconds
    const interval = setInterval(fetchIssData, 2000);

    return () => clearInterval(interval);
  }, []);

  const globeConfig = {
    autoRotate: true,
    autoRotateSpeed: 1,
    globeColor: "#000000",
    emissive: "#91BAD6",
    emissiveIntensity: 0.2,
    shininess: 0.9,
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <StarsBackground className="absolute inset-0 z-0" />
      <h1 className="text-7xl font-host-grotesk mb-4 text-white">Real-Time ISS Tracker</h1>
      <div className="w-[600px] h-[600px]">
        <Globe
          issLatitude={issPosition.latitude}
          issLongitude={issPosition.longitude}
          globeConfig={globeConfig}
        />
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-host-grotesk text-white">Current ISS Coordinates</h2>
        <p className="text-lg font-host-grotesk text-white">
          Latitude: <span>{issPosition.latitude.toFixed(6)}</span>
        </p>
        <p className="text-lg font-host-grotesk text-white">
          Longitude: <span>{issPosition.longitude.toFixed(6)}</span>
        </p>
        <p className="text-lg font-host-grotesk text-white">
          Country Code: <span>{issPosition.countryCode}</span>
        </p>
      </div>
    </div>
  );
}