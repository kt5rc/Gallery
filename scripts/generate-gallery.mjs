import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");
const OUT_JSON = path.join(GALLERY_DIR, "gallery.json");

/** Forge JPG EXIF UserComment のデコード（UNICODEヘッダ＆NULL除去対応） */
function decodeUserComment(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw.replace(/\u0000/g, "");

  if (raw instanceof Uint8Array) {
    let bytes = raw;

    // "UNICODE\0\0" ヘッダ除去（Forge/Windows系で付くことがある）
    const header = Buffer.from("UNICODE");
    if (bytes.slice(0, 7).every((v, i) => v === header[i])) {
      bytes = bytes.slice(8); // UNICODE + \0 を想定して8バイト落とす
    }

    // UTF-8としてデコード
    const text = new TextDecoder("utf-8").decode(bytes);

    // ★超重要：NULL文字除去★
    return text.replace(/\u0000/g, "");
  }

  return "";
}

/** 抽象アート向け：promptから短いタイトル要素を作る */
function generateTitleFromPrompt(prompt) {
  if (!prompt) return "Abstract Composition";

  const p = prompt.toLowerCase();
  const parts = [];

  if (p.includes("geometric")) parts.push("Geometric");
  if (p.includes("organic") || p.includes("flowing")) parts.push("Flowing");
  if (p.includes("gradient")) parts.push("Gradient");
  if (p.includes("minimal")) parts.push("Minimal");
  if (p.includes("abstract")) parts.push("Abstract");

  return parts.length ? parts.join(" ") : "Abstract Composition";
}

/** seedから被りにくいタイトル要素を作る（決定論） */
const SHAPES = [
  "Flowing Geometry",
  "Layered Forms",
  "Soft Waves",
  "Abstract Curves",
  "Geometric Balance",
  "Silent Patterns",
];

const MOODS = ["Calm", "Dynamic", "Muted", "Refined", "Minimal", "Modern"];

function generateSeedTitle(seedNum) {
  const s = Number.isFinite(seedNum) ? seedNum : 0;
  const shape = SHAPES[s % SHAPES.length];
  const mood = MOODS[Math.floor(s / 10) % MOODS.length];
  return `${shape} ${mood} #${s}`;
}

function generateTitle({ prompt, seed }) {
  const base = generateTitleFromPrompt(prompt);
  const variation = generateSeedTitle(seed);
  return `${base} – ${variation}`;
}

/** parameters を分解 */
function parseParameters(text) {
  const normalized = (text || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return {
      title: "Abstract Composition – Silent Patterns Calm #0",
      prompt: "",
      negativePrompt: "",
      seed: undefined,
      steps: undefined,
      sampler: undefined,
      cfg: undefined,
      size: undefined,
      model: undefined,
      modelHash: undefined,
      vae: undefined,
      version: undefined,
      freeu: undefined,
      loras: [],
    };
  }

  // "Negative prompt:" を境に分割
  const [promptPart, rest1] = normalized.split(/\nNegative prompt:\s*/);

  const prompt = promptPart
    ?.trim()
    ?.replace(/\s*,\s*/g, ", ")
    ?.replace(/,\s*$/, "");

  let negativePrompt = "";
  let metaLine = "";

  if (rest1) {
    // "Steps:" を境に negative と meta を分割
    const [neg, rest2] = rest1.split(/\nSteps:\s*/);
    negativePrompt = neg
      ?.trim()
      ?.replace(/\s*,\s*/g, ", ")
      ?.replace(/,\s*$/, "");
    metaLine = rest2 ? `Steps: ${rest2.trim()}` : "";
  }

  // metaLine を key: value に分解
  const meta = {};
  if (metaLine) {
    metaLine
      .split(",")
      .map((s) => s.trim())
      .forEach((part) => {
        const m = part.match(/^([^:]+):\s*(.*)$/);
        if (m) meta[m[1].trim()] = m[2].trim();
      });
  }

  // sampler + schedule
  const samplerBase = meta["Sampler"];
  const schedule = meta["Schedule type"];
  const sampler =
    samplerBase && schedule ? `${samplerBase} ${schedule}` : samplerBase;

  // seed はタイトルにも使うので先に確定
  const seed = meta["Seed"] ? Number(meta["Seed"]) : undefined;

  // LoRA 抽出
  const loras = [];
  const loraRegex = /<lora:([^:>]+):([^>]+)>/g;
  let lm;
  while ((lm = loraRegex.exec(prompt || ""))) {
    loras.push(`${lm[1]}:${lm[2]}`);
  }

  // タイトル（manualTitle は今回は未導入）
  const title = generateTitle({ prompt, seed });

  return {
    title,
    prompt,
    negativePrompt,
    steps: meta["Steps"] ? Number(meta["Steps"]) : undefined,
    sampler,
    cfg: meta["CFG scale"] ? Number(meta["CFG scale"]) : undefined,
    seed,
    size: meta["Size"],
    model: meta["Model"],
    modelHash: meta["Model hash"],
    vae: meta["Module 1"] || meta["VAE"],
    version: meta["Version"],
    freeu:
      meta["freeu_enabled"] != null
        ? {
            enabled: String(meta["freeu_enabled"]).toLowerCase() === "true",
            b1: meta["freeu_b1"] ? Number(meta["freeu_b1"]) : undefined,
            b2: meta["freeu_b2"] ? Number(meta["freeu_b2"]) : undefined,
            s1: meta["freeu_s1"] ? Number(meta["freeu_s1"]) : undefined,
            s2: meta["freeu_s2"] ? Number(meta["freeu_s2"]) : undefined,
            start: meta["freeu_start"]
              ? Number(meta["freeu_start"])
              : undefined,
            end: meta["freeu_end"] ? Number(meta["freeu_end"]) : undefined,
          }
        : undefined,
    loras,
  };
}

/** 超簡易タグ推定（後で賢くしてOK） */
function guessTags(prompt = "") {
  const p = (prompt || "").toLowerCase();
  const tags = [];

  // 抽象テーマ向け（例）
  if (p.includes("geometric")) tags.push("geometric");
  if (p.includes("organic") || p.includes("flowing")) tags.push("flow");
  if (p.includes("gradient")) tags.push("gradient");
  if (p.includes("minimal")) tags.push("minimal");
  if (p.includes("monochrome")) tags.push("monochrome");
  if (p.includes("pastel")) tags.push("pastel");

  return tags.length ? tags : ["abstract"];
}

function listImages(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((n) => /\.(jpe?g)$/i.test(n))
    .filter((n) => n !== "gallery.json");
}

function shuffleArray(array) {
  // Fisher–Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function main() {
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error("gallery dir not found:", GALLERY_DIR);
    process.exit(1);
  }

  const files = listImages(GALLERY_DIR);
  const items = [];

  for (const file of files) {
    const full = path.join(GALLERY_DIR, file);

    const exif = await exifr.parse(full, {
      userComment: true,
      imageDescription: true,
      software: true,
      xmp: true,
    });

    // Forgeは格納先が揺れるのでフォールバック
    const raw =
      decodeUserComment(exif?.userComment) ||
      decodeUserComment(exif?.imageDescription) ||
      decodeUserComment(exif?.software) ||
      decodeUserComment(exif?.xmp?.Description) ||
      "";

    const parsed = parseParameters(raw);

    const base = path.parse(file).name;
    const id = Number.isFinite(parsed.seed) ? String(parsed.seed) : base;

    items.push({
      id,
      src: `/gallery/${file}`,
      title: parsed.title,
      tags: guessTags(parsed.prompt),
      ...parsed,
      createdAt: new Date().toISOString().slice(0, 10),
      // rawParameters: raw, // デバッグ用に残したいならON
    });
  }

  // ここは必要なら後で「EXIF DateTimeOriginal」等に変更
  //items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  shuffleArray(items);

  fs.writeFileSync(OUT_JSON, JSON.stringify(items, null, 2), "utf-8");
  console.log(`✅ Wrote ${items.length} items -> ${OUT_JSON}`);
}

main().catch((e) => {
  console.error("❌ gallery:gen failed:", e);
  process.exit(1);
});
