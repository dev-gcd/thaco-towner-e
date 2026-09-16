// Central content loader. Each landing block reads its content from a JSON file
// under content/, resolved at build time (the site is a static export).
//
// This project is Vietnamese-only: text fields are plain strings. If English is
// ever needed, switch the fields to { vi, en } and reintroduce a `pick()` helper
// (see thaco-truck-sale-page for the bilingual variant).
//
// ── Adding an editable block (recipe) ────────────────────────────────────────
// 1. content/<block>.json + snapshot content/defaults/<block>.json
// 2. type + `export const <block>` here
// 3. section component reads from this loader (literals only, keep layout/CSS)
// 4. components/admin/<Block>Editor.tsx using ui.tsx + useContent.ts
// 5. register the key in CONTENT_FILES (worker/index.ts AND scripts/cms-dev.mjs)
//    + CONTENT_ITEMS in components/admin/AdminApp.tsx

/** A content image with an optional per-breakpoint mobile override. */
export type CmsImage = {
  src: string;
  srcMobile?: string;
  alt: string;
};

// ── Blocks ───────────────────────────────────────────────────
// Empty until the Figma layout is readable. Blocks are added one at a time
// following the recipe above.
