import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type ImportedRecipe = {
  title: string;
  description: string;
  image: string;
  ingredients: string[];
  steps: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  tags: string[];
  sourceHost: string;
  usedFallback: boolean;
};

const MAX_HTML_BYTES = 5_000_000;
const REQUEST_TIMEOUT_MS = 12_000;

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value: unknown) {
  return decodeHtml(String(value ?? ""))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map(cleanText).filter(Boolean)));
}

function parseServings(value: unknown) {
  const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  const match = text.match(/\d+/);

  return match ? Number(match[0]) : 0;
}

function extractTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";

  return cleanText(title.replace(/\s*[|–-]\s*[^|–-]+$/, ""));
}

function extractMetaContent(html: string, names: string[]) {
  for (const name of names) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(
        `<meta\\b(?=[^>]*(?:property|name)=["']${escapedName}["'])(?=[^>]*content=["']([^"']*)["'])[^>]*>`,
        "i"
      ),
      new RegExp(
        `<meta\\b(?=[^>]*content=["']([^"']*)["'])(?=[^>]*(?:property|name)=["']${escapedName}["'])[^>]*>`,
        "i"
      )
    ];
    const match = patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean);

    if (match) {
      return cleanText(match);
    }
  }

  return "";
}

function extractLdJsonScripts(html: string) {
  const matches = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  return Array.from(matches, (match) => decodeHtml(match[1].trim()));
}

function parseJsonSafely(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    const cleaned = value.replace(/^\s*<!--/, "").replace(/-->\s*$/, "");

    return JSON.parse(cleaned);
  }
}

function asTypeList(value: unknown) {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : [String(value ?? "")];
}

function isRecipeNode(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const node = value as Record<string, unknown>;
  return asTypeList(node["@type"]).some((type) => type.toLowerCase() === "recipe");
}

function findRecipeNode(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (isRecipeNode(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipeNode(item);
      if (found) {
        return found;
      }
    }

    return null;
  }

  const node = value as Record<string, unknown>;
  const childKeys = ["@graph", "mainEntity", "mainEntityOfPage", "itemListElement"];

  for (const key of childKeys) {
    const found = findRecipeNode(node[key]);
    if (found) {
      return found;
    }
  }

  return null;
}

function readImage(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return readImage(value[0]);
  }

  if (typeof value === "object") {
    const image = value as Record<string, unknown>;
    return readImage(image.url ?? image.contentUrl);
  }

  return "";
}

function readStringArray(value: unknown, splitOnComma = true): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => readStringArray(entry, splitOnComma));
  }

  return String(value)
    .split(splitOnComma ? /\r?\n|,/ : /\r?\n/)
    .map(cleanText)
    .filter(Boolean);
}

function readInstructions(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map(cleanText)
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap(readInstructions);
  }

  if (typeof value === "object") {
    const node = value as Record<string, unknown>;
    const nested = readInstructions(node.itemListElement);

    if (nested.length > 0) {
      return nested;
    }

    return [cleanText(node.text ?? node.name)].filter(Boolean);
  }

  return [];
}

function readKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return uniqueList(value.map((entry) => String(entry))).slice(0, 8);
  }

  return uniqueList(
    String(value ?? "")
      .split(",")
      .map((entry) => entry.trim())
  ).slice(0, 8);
}

function readRecipeFromStructuredData(html: string) {
  for (const script of extractLdJsonScripts(html)) {
    try {
      const recipe = findRecipeNode(parseJsonSafely(script));

      if (recipe) {
        return recipe;
      }
    } catch {
      // Some sites include invalid JSON-LD. Keep trying the rest of the page.
    }
  }

  return null;
}

function isBlockedIpv4(ip: string) {
  const [first = 0, second = 0] = ip.split(".").map(Number);

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isBlockedIpv6(ip: string) {
  const normalized = ip.toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isBlockedAddress(address: string) {
  const family = isIP(address);

  if (family === 4) {
    return isBlockedIpv4(address);
  }

  if (family === 6) {
    return isBlockedIpv6(address);
  }

  return true;
}

async function assertSafeImportUrl(url: URL) {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Please enter a website link that starts with http or https.");
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Please enter a public recipe link.");
  }

  if (isIP(hostname) && isBlockedAddress(hostname)) {
    throw new Error("Please enter a public recipe link.");
  }

  let addresses: Array<{ address: string; family: number }>;

  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new Error("That link could not be reached. Please check the URL and try again.");
  }

  if (addresses.some((address) => isBlockedAddress(address.address))) {
    throw new Error("Please enter a public recipe link.");
  }
}

function absolutizeUrl(value: string, sourceUrl: URL) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, sourceUrl).toString();
  } catch {
    return "";
  }
}

function makeFallbackStep(sourceHost: string) {
  return `Open the original ${sourceHost} link to review the full cooking instructions.`;
}

function makeFallbackIngredient(sourceHost: string) {
  return `Review the original ${sourceHost} link for the ingredient list.`;
}

export async function importRecipeFromUrl(rawUrl: string): Promise<ImportedRecipe> {
  let sourceUrl: URL;

  try {
    sourceUrl = new URL(rawUrl);
  } catch {
    throw new Error("Please enter a valid recipe link.");
  }

  await assertSafeImportUrl(sourceUrl);

  let response: Response;

  try {
    response = await fetch(sourceUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "user-agent":
          "Mozilla/5.0 (compatible; RecipeNook/1.0; +https://github.com/amandagw/recipe-nook)"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch {
    throw new Error("That link could not be opened. Please check the URL and try again.");
  }

  if (!response.ok) {
    throw new Error("That link could not be opened. Please check the URL and try again.");
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);

  if (contentLength > MAX_HTML_BYTES) {
    throw new Error("That page is too large to import safely.");
  }

  const html = await response.text();
  const sourceHost = sourceUrl.hostname.replace(/^www\./, "");
  const recipe = readRecipeFromStructuredData(html);
  const metaTitle = extractMetaContent(html, ["og:title", "twitter:title"]) || extractTitle(html);
  const metaDescription = extractMetaContent(html, [
    "og:description",
    "twitter:description",
    "description"
  ]);
  const metaImage = extractMetaContent(html, ["og:image", "twitter:image"]);

  if (recipe) {
    const title = cleanText(recipe.name) || metaTitle || "Imported Recipe";
    const ingredients = uniqueList(readStringArray(recipe.recipeIngredient, false));
    const steps = uniqueList(readInstructions(recipe.recipeInstructions));
    const description = cleanText(recipe.description) || metaDescription;
    const tags = uniqueList([
      ...readStringArray(recipe.recipeCategory),
      ...readStringArray(recipe.recipeCuisine),
      ...readKeywords(recipe.keywords)
    ]).slice(0, 8);

    return {
      title,
      description,
      image: absolutizeUrl(readImage(recipe.image) || metaImage, sourceUrl),
      ingredients: ingredients.length > 0 ? ingredients : [makeFallbackIngredient(sourceHost)],
      steps: steps.length > 0 ? steps : [makeFallbackStep(sourceHost)],
      servings: parseServings(recipe.recipeYield),
      prepTime: cleanText(recipe.prepTime),
      cookTime: cleanText(recipe.cookTime),
      tags,
      sourceHost,
      usedFallback: ingredients.length === 0 || steps.length === 0
    };
  }

  return {
    title: metaTitle || "Imported Recipe",
    description: metaDescription,
    image: absolutizeUrl(metaImage, sourceUrl),
    ingredients: [makeFallbackIngredient(sourceHost)],
    steps: [makeFallbackStep(sourceHost)],
    servings: 0,
    prepTime: "",
    cookTime: "",
    tags: [],
    sourceHost,
    usedFallback: true
  };
}
