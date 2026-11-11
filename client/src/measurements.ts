import type { Measurements } from "./types";

export const measurementFields: { key: keyof Measurements; label: string }[] = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeve", label: "Sleeve" },
  { key: "neck", label: "Neck" },
  { key: "length", label: "Length" },
  { key: "trouserLength", label: "Trouser length" },
];
