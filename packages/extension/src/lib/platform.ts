import { Platform } from "../types/space";
import { domainFromUrl } from "./sourceMetadata";

const platformMatchers: Array<[Platform, RegExp]> = [
  ["instagram", /(^|\.)instagram\.com$/],
  ["twitter", /(^|\.)(x|twitter)\.com$/],
  ["linkedin", /(^|\.)linkedin\.com$/],
  ["facebook", /(^|\.)(facebook|fb)\.com$/],
  ["youtube", /(^|\.)(youtube\.com|youtu\.be)$/],
  ["tiktok", /(^|\.)tiktok\.com$/],
  ["reddit", /(^|\.)reddit\.com$/],
  ["pinterest", /(^|\.)pinterest\.[a-z.]+$/],
  ["github", /(^|\.)github\.com$/],
];

export function detectPlatform(sourceUrl?: string): Platform {
  const hostname = domainFromUrl(sourceUrl).toLowerCase();
  return platformMatchers.find(([, matcher]) => matcher.test(hostname))?.[0] || "web";
}
