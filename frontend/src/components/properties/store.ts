"use client";

import {
  COMPOUNDS,
  LOCATIONS,
  MEDIA,
  PRICES,
  PROPERTY_TYPES,
  UNIT_MODELS,
} from "@/mock/properties";

import { createMemoryStore } from "./format";

export const useLocationsStore = createMemoryStore(LOCATIONS);
export const useCompoundsStore = createMemoryStore(COMPOUNDS);
export const usePropertyTypesStore = createMemoryStore(PROPERTY_TYPES);
export const useUnitModelsStore = createMemoryStore(UNIT_MODELS);
export const usePricesStore = createMemoryStore(PRICES);
export const useMediaStore = createMemoryStore(MEDIA);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
