import { DEFAULT_SETTINGS } from "@/mock/administration";
import type { MediaKind } from "@/mock/properties";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PLAN_TYPES = ["application/pdf", "image/png"];
export const VIDEO_TYPES = ["video/mp4"];
export const MAX_IMAGE_MB = DEFAULT_SETTINGS.uploadMaxImageMb;
export const MAX_VIDEO_MB = DEFAULT_SETTINGS.uploadMaxVideoMb;
export const ACCEPT = [...new Set([...IMAGE_TYPES, ...PLAN_TYPES, ...VIDEO_TYPES])].join(",");

export type UploadCheck = { ok: true; kind: MediaKind } | { ok: false; errorKey: "type" | "imageSize" | "videoSize" };

/**
 * Client-side pre-check mirroring the backend rules (type allow-list and size
 * limits from system settings). The backend re-validates; this only gives
 * fast feedback.
 */
export function checkUpload(file: File, preferredKind?: MediaKind): UploadCheck {
  const type = file.type;
  const sizeMb = file.size / 1_000_000;
  if (VIDEO_TYPES.includes(type)) {
    return sizeMb > MAX_VIDEO_MB ? { ok: false, errorKey: "videoSize" } : { ok: true, kind: "video" };
  }
  if (IMAGE_TYPES.includes(type) || PLAN_TYPES.includes(type)) {
    if (sizeMb > MAX_IMAGE_MB) return { ok: false, errorKey: "imageSize" };
    if (type === "application/pdf") return { ok: true, kind: "floor_plan" };
    return { ok: true, kind: preferredKind === "floor_plan" ? "floor_plan" : "image" };
  }
  return { ok: false, errorKey: "type" };
}
