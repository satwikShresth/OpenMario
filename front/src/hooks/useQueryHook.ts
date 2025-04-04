import { useState, useCallback, useRef } from "react";

/**
 * A custom React hook that provides a debounced query hook and network-aware timeout adjustment
 * @param {number} initialTimeout - Default timeout in milliseconds
 * @returns {Object} Object containing queryHook and updateTimeout functions
 */
export const useQueryHook = (initialTimeout = 300) => {
  const [timeout, setTimeoutValue] = useState(initialTimeout);
  const timerIdRef = useRef(null);

  // Network-aware timeout updater
  const updateTimeout = useCallback(() => {
    if (typeof navigator.connection === "undefined") return;

    const connection = navigator.connection;
    const newTimeout = ["slow-2g", "2g"].includes(connection?.effectiveType)
      ? Math.max(initialTimeout, 400)
      : initialTimeout;

    setTimeoutValue(newTimeout);
    return newTimeout;
  }, [initialTimeout]);

  // Query hook that returns a function to be used with a search
  const queryHook = useCallback(
    (query, search) => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }

      timerIdRef.current = window.setTimeout(() => {
        search(query);
        timerIdRef.current = null;
      }, timeout);
    },
    [timeout],
  );

  return {
    queryHook,
    updateTimeout,
  };
};
