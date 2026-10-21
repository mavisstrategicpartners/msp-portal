import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new CustomEvent("local-storage-update", { detail: { key, value: valueToStore } }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("key" in e && e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {}
      } else if ("detail" in e && (e as CustomEvent).detail?.key === key) {
        setStoredValue((e as CustomEvent).detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener("local-storage-update", handleStorageChange as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorageChange as EventListener);
      window.removeEventListener("local-storage-update", handleStorageChange as EventListener);
    };
  }, [key]);

  return [storedValue, setValue];
}
