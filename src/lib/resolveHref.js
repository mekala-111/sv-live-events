import { platformUrl } from "@/lib/platform";

/** Resolve hrefs that use `platform:/path` or pass through anchors/urls */
export function resolveHref(href) {
  if (!href) return "#";
  if (href.startsWith("platform:")) {
    return platformUrl(href.replace("platform:", ""));
  }
  return href;
}
