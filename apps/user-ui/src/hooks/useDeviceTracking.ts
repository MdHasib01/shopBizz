"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const useDeviceTracking = () => {
  const [device, setDevice] = useState<string | null>(null);
  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDevice(
      `${result.device.type || "Unknown Device"} - ${result.os.name} ${
        result.os.version
      } - ${result.browser.name} ${result.browser.version}`
    );
  }, []);
  return device;
};

export default useDeviceTracking;
