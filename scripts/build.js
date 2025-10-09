// scripts/build.js
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dataDir = path.join(root, "data");
const itemsDir = path.join(dataDir, "items");
const outDir = path.join(root, "docs");
const outFile = path.join(outDir, "partners.json");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isISODate(s) {
  return !isNaN(Date.parse(s));
}

function rupiahInt(n) {
  return Number.isInteger(n) && n >= 0;
}

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const categories = readJSON(path.join(dataDir, "categories.json"));
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error("categories.json harus berupa array berisi string kategori");
  }

  const files = fs.readdirSync(itemsDir).filter(f => f.endsWith(".json"));
  const items = [];

  for (const f of files) {
    const item = readJSON(path.join(itemsDir, f));
    const required = ["id", "name", "category"];
    for (const key of required) {
      if (!item[key]) throw new Error(`${f}: field '${key}' wajib ada`);
    }
    if (!categories.includes(item.category)) {
      throw new Error(`${f}: category '${item.category}' tidak ada di categories.json`);
    }
    if (item.createdAt && !isISODate(item.createdAt)) {
      throw new Error(`${f}: createdAt harus ISO date string`);
    }
    if (item.updatedAt && !isISODate(item.updatedAt)) {
      throw new Error(`${f}: updatedAt harus ISO date string`);
    }
    if (item.pricing && !Array.isArray(item.pricing)) {
      throw new Error(`${f}: pricing harus array`);
    }
    if (Array.isArray(item.pricing)) {
      for (const p of item.pricing) {
        if (!("label" in p) || !("price" in p) || !rupiahInt(p.price)) {
          throw new Error(`${f}: pricing item invalid (periksa label/price integer >= 0)`);
        }
      }
    }

    items.push(item);
  }

  items.sort((a, b) => {
    const da = a.createdAt ? Date.parse(a.createdAt) : 0;
    const db = b.createdAt ? Date.parse(b.createdAt) : 0;
    if (db !== da) return db - da;
    return a.name.localeCompare(b.name);
  });

  const payload = { categories, items };

  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
  console.log(`OK → ${path.relative(root, outFile)} (${items.length} items)`);
}

main();
