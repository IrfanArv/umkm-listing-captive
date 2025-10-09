# Captive-UMKM-List

Git-based data → build `docs/partners.json` untuk captive portal.

## Struktur

- `data/categories.json` — daftar kategori
- `data/items/*.json` — satu file per item
- `scripts/build.js` — gabungkan & validasi → `docs/partners.json`
- `docs/` — folder yang dipublish via GitHub Pages

## Development

```bash
node scripts/build.js
```
