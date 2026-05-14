import type { GroupTone } from "@/data/market";

/**
 * Colour system. Everything resolves to the CSS variables declared in
 * `app/globals.css`, so light/dark is handled in one place and never with
 * scattered `dark:` variants.
 *
 *  - Semantic states (`stateColor`) — free/paid → success, occupied/pending →
 *    warning, overdue → danger. Use the Tailwind tokens directly in JSX:
 *    `bg-warning/10 text-warning border-warning/25`.
 *  - Categorical tones (`toneClasses` / `toneColor`) — one per car group.
 *
 * For SVG / inline-style chart fills use the `*Color` maps (CSS var refs);
 * for class names use `toneClasses` (literal strings so Tailwind can see them).
 */

/* ---- Semantic state colours (for charts / inline styles) ---- */

export const stateColor = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
} as const;

/* ---- Categorical group tones ---- */

export const toneColor: Record<GroupTone, string> = {
  amber: "var(--tone-amber)",
  blue: "var(--tone-blue)",
  rose: "var(--tone-rose)",
  sky: "var(--tone-sky)",
  emerald: "var(--tone-emerald)",
  violet: "var(--tone-violet)",
};

export type ToneClasses = {
  /** solid fill — status dots */
  dot: string;
  /** tinted surface for an icon chip */
  chip: string;
  /** accent text / icon colour */
  label: string;
  /** faint tinted surface + border, e.g. grid band backgrounds */
  softBg: string;
  softBorder: string;
};

/**
 * Class bundles per tone. Every tone follows the identical pattern — only the
 * token name changes — so the system stays uniform. Strings are written out
 * literally because Tailwind only generates classes it can see at build time.
 */
export const toneClasses: Record<GroupTone, ToneClasses> = {
  amber: {
    dot: "bg-tone-amber",
    chip: "bg-tone-amber/15",
    label: "text-tone-amber",
    softBg: "bg-tone-amber/[0.07]",
    softBorder: "border-tone-amber/25",
  },
  blue: {
    dot: "bg-tone-blue",
    chip: "bg-tone-blue/15",
    label: "text-tone-blue",
    softBg: "bg-tone-blue/[0.07]",
    softBorder: "border-tone-blue/25",
  },
  rose: {
    dot: "bg-tone-rose",
    chip: "bg-tone-rose/15",
    label: "text-tone-rose",
    softBg: "bg-tone-rose/[0.07]",
    softBorder: "border-tone-rose/25",
  },
  sky: {
    dot: "bg-tone-sky",
    chip: "bg-tone-sky/15",
    label: "text-tone-sky",
    softBg: "bg-tone-sky/[0.07]",
    softBorder: "border-tone-sky/25",
  },
  emerald: {
    dot: "bg-tone-emerald",
    chip: "bg-tone-emerald/15",
    label: "text-tone-emerald",
    softBg: "bg-tone-emerald/[0.07]",
    softBorder: "border-tone-emerald/25",
  },
  violet: {
    dot: "bg-tone-violet",
    chip: "bg-tone-violet/15",
    label: "text-tone-violet",
    softBg: "bg-tone-violet/[0.07]",
    softBorder: "border-tone-violet/25",
  },
};
