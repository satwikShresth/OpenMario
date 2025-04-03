import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFilterStore } from "#/stores/useFilterStore";

export function useFilterNavigation() {
  const navigate = useNavigate({ from: "/home" });
  const searchParams = useFilterStore(
    ({
      company,
      position,
      location,
      year,
      coop_year,
      coop_cycle,
      program_level,
      distinct,
      pageIndex,
      pageSize,
    }) => ({
      company,
      position,
      location,
      year,
      coop_year,
      coop_cycle,
      program_level,
      distinct,
      pageIndex,
      pageSize,
    }),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("redoing the params", searchParams);
      navigate({
        from: "/home",
        to: "/home",
        search: () => searchParams,
        replace: true,
        reloadDocument: false,
        resetScroll: false,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return null;
}
