const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export interface StreetStatus {
  open: boolean;
  override: boolean;
  serverTime: string;
  closesAt: string | null;
  nextOpeningAt: string;
}

export async function fetchStatus(signal?: AbortSignal): Promise<StreetStatus> {
  const res = await fetch(`${API_BASE}/status`, { credentials: "include", signal });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return (await res.json()) as StreetStatus;
}
