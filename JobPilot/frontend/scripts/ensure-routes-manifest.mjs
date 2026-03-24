import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getRouteRegex } from "next/dist/shared/lib/router/utils/route-regex.js";
import { RSC_PREFETCH_SUFFIX, RSC_SUFFIX } from "next/dist/lib/constants.js";
import {
  NEXT_DID_POSTPONE_HEADER,
  NEXT_ROUTER_PREFETCH_HEADER,
  RSC_HEADER,
} from "next/dist/client/components/app-router-headers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "..");
const distDir = path.join(frontendDir, ".next");
const routesManifestPath = path.join(distDir, "routes-manifest.json");
const appPathRoutesManifestPath = path.join(distDir, "app-path-routes-manifest.json");

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
}

function toStaticRoute(page) {
  const normalized = page === "/" ? "/" : page.replace(/\/+$/, "");
  const regex = normalized === "/" ? "^/(?:/)?$" : `^${escapeRegex(normalized)}(?:/)?$`;
  return {
    page,
    regex,
    routeKeys: {},
    namedRegex: regex,
  };
}

function toDynamicRoute(page) {
  const routeRegex = getRouteRegex(page);
  return {
    page,
    regex: routeRegex.re.source,
    routeKeys: routeRegex.routeKeys ?? {},
    namedRegex: routeRegex.namedRegex ?? routeRegex.re.source,
  };
}

async function ensureRoutesManifest() {
  const appPathRoutesManifest = JSON.parse(
    await fs.readFile(appPathRoutesManifestPath, "utf8")
  );

  const pages = [
    ...new Set(
      Object.values(appPathRoutesManifest).filter(
        (route) => typeof route === "string" && route !== "/_not-found"
      )
    ),
  ].sort();

  const staticRoutes = [];
  const dynamicRoutes = [];

  for (const page of pages) {
    if (page.includes("[") && page.includes("]")) {
      dynamicRoutes.push(toDynamicRoute(page));
    } else {
      staticRoutes.push(toStaticRoute(page));
    }
  }

  const routesManifest = {
    version: 3,
    pages404: true,
    basePath: "",
    redirects: [],
    rewrites: {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    },
    headers: [],
    staticRoutes,
    dynamicRoutes,
    dataRoutes: [],
    rsc: {
      header: RSC_HEADER,
      didPostponeHeader: NEXT_DID_POSTPONE_HEADER,
      varyHeader: `${RSC_HEADER}, ${NEXT_ROUTER_PREFETCH_HEADER}, Next-Router-State-Tree, Next-Url`,
      prefetchHeader: NEXT_ROUTER_PREFETCH_HEADER,
      suffix: RSC_SUFFIX,
      prefetchSuffix: RSC_PREFETCH_SUFFIX,
    },
    skipMiddlewareUrlNormalize: false,
    caseSensitive: false,
  };

  await fs.writeFile(routesManifestPath, `${JSON.stringify(routesManifest, null, 2)}\n`, "utf8");
}

await ensureRoutesManifest();
