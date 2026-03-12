import { useState, useEffect } from "react";

/**
 * Retrasa la actualización de un valor hasta que el usuario deje de escribir.
 * Ideal para inputs de búsqueda sobre datasets grandes.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
