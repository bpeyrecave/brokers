import type { ConversionRecord } from "./types";

/**
 * Storage is behind this small interface on purpose: v1 ships with
 * localStorage only (so nothing syncs between Victor's and Berta's devices),
 * but a later version could swap in a shared backend (e.g. Supabase) by
 * implementing the same interface without touching any component code.
 */
export interface ConversionStore {
  list(): ConversionRecord[];
  add(record: ConversionRecord): void;
  remove(id: string): void;
}

const KEY = "hodling.conversions.v1";

class LocalStorageConversionStore implements ConversionStore {
  list(): ConversionRecord[] {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  add(record: ConversionRecord): void {
    const current = this.list();
    current.push(record);
    window.localStorage.setItem(KEY, JSON.stringify(current));
  }

  remove(id: string): void {
    const current = this.list().filter((r) => r.id !== id);
    window.localStorage.setItem(KEY, JSON.stringify(current));
  }
}

export const conversionStore: ConversionStore = new LocalStorageConversionStore();
