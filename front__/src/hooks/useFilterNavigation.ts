import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFilterStore } from "#/stores/useFilterStore";

export function useFilterNavigation() {
  const navigate = useNavigate({ from: "/home" });
  const searchParams = useFilterStore((state) => ({
    company: state.company,
    position: state.position,
    location: state.location,
    year: state.year,
    coop_year: state.coop_year,
    coop_cycle: state.coop_cycle,
    program_level: state.program_level,
    distinct: state.distinct,
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
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
