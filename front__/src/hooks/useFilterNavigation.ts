import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFilterStore } from "#/stores/useFilterStore";

export function useFilterNavigation() {
  const navigate = useNavigate({ from: "/home" });
  const {
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
  } = useFilterStore();

  // Watch for changes in the filter state and update URL
  useEffect(() => {
    // Create a search params object with only defined values
    const searchParams = {
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
    };
    //console.log(searchParams);
    //const filteredParams = Object.fromEntries(
    //  Object.entries(searchParams).filter(([key, value]) => {
    //    // Check if value is defined
    //    if (value === undefined || value === null) return false;
    //
    //    if (value === "") return false;
    //
    //    // Check if value is an empty array
    //    if (Array.isArray(value) && value.length === 0) return false;
    //
    //    return true;
    //  }),
    //);
    //
    //console.log(filteredParams);

    const timer = setTimeout(() => {
      navigate({
        from: "/home",
        to: "/home",
        search: () => searchParams,
        replace: true,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [
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
    navigate,
  ]);

  return null;
}
