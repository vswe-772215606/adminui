import { format, formatDistanceStrict } from "date-fns";
import { uzCyrl } from "date-fns/locale/uz-Cyrl";

export function formatUzs(amount: number): string {
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatTime(ts: number): string {
  return format(ts, "dd.MM.yyyy HH:mm");
}

export function formatTimeShort(ts: number): string {
  return format(ts, "HH:mm");
}

export function formatDuration(fromTs: number, toTs: number): string {
  return formatDistanceStrict(toTs, fromTs, { locale: uzCyrl });
}

export function formatPlate(plate: string): string {
  return plate.trim().toUpperCase();
}

/**
 * Live ticking clock for elapsed time: "HH:MM:SS", or "Nд HH:MM:SS" past 24h.
 */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const clock = `${pad(h)}:${pad(m)}:${pad(s)}`;
  return days > 0 ? `${days}д ${clock}` : clock;
}
