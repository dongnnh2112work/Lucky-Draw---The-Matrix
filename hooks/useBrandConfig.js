import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { brandConfig as defaultConfig } from "../lib/brandConfig";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "";

export function useBrandConfig() {
  const pathname = usePathname();
  const [config, setConfig] = useState(defaultConfig);
  const [isLoading, setLoad] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathAlias = pathname?.split("/").filter(Boolean)[0];
    const queryBrand = params.get("brand");
    const identifier = pathAlias || queryBrand;
    if (!identifier || !ADMIN_URL) return;

    setLoad(true);
    fetch(`${ADMIN_URL}/api/brand-alias/${identifier}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const b = data.brand ?? data;
        setConfig((prev) => ({
          ...prev,
          ...(b.logoUrl && { logoUrl: b.logoUrl }),
          ...(b.primaryColor && { primaryColor: b.primaryColor, wheelBorderColor: b.primaryColor }),
          ...(b.fontFamily && { fontFamily: b.fontFamily }),
        }));
      })
      .catch(() => console.warn("[useBrandConfig] fetch failed, using default"))
      .finally(() => setLoad(false));
  }, [pathname]);

  return { config, isLoading };
}
