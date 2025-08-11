"use client";

import { time, timeStamp } from "console";
import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 30;

const getStoredLocation = () => {
  try {
    const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!storedLocation) return null;

    const parsedData = JSON.parse(storedLocation);
    const expiryTIme = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsedData.timestamp > expiryTIme;

    return isExpired ? null : parsedData;
  } catch (error) {
    console.error("Error retrieving location from local storage:", error);
  }
  return null;
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    country: string;
    city: string;
  } | null>(getStoredLocation());

  useEffect(() => {
    if (location) return;
    fetch("https://ip-api.com/json/")
      .then((response) => response.json())
      .then((data) => {
        const newLocation = {
          country: data.country,
          city: data.city,
          timeStamp: Date.now(),
        };
        setLocation(newLocation);
        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify({ ...newLocation, timestamp: Date.now() })
        );
      });
  }, [location]);

  return location;
};

export default useLocationTracking;
