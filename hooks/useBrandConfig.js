import { useState, useEffect } from "react";
import { brandConfig as defaultConfig } from "../lib/brandConfig";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "";

export function useBrandConfig() {
  const [config, setConfig] = useState(defaultConfig);
  const [isLoading, setLoad] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("brand");
    if (!slug || !ADMIN_URL) return;

    setLoad(true);
    fetch(`${ADMIN_URL}/api/brand/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const b = data.brand;
        setConfig((prev) => ({
          ...prev,
          ...(b.logoUrl && { logoUrl: b.logoUrl }),
          ...(b.primaryColor && { primaryColor: b.primaryColor, wheelBorderColor: b.primaryColor }),
          ...(b.fontFamily && { fontFamily: b.fontFamily }),
        }));
      })
      .catch(() => console.warn("[useBrandConfig] fetch failed, using default"))
      .finally(() => setLoad(false));
  }, []);

  return { config, isLoading };
}
