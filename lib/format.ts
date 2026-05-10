import { format, formatDistanceStrict } from "date-fns";
import { uzCyrl } from "date-fns/locale/uz-Cyrl";

export function formatUzs(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount);
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
