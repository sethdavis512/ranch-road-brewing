# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Ranch Road Brewing Co.** is a concept marketing site for a fictional Hill Country taproom, built as a Tech with Seth showcase. Every page is composed in Contentful from a bank of blocks; the brewery's staff could change the tap list, events, menu, banner, and pages without a developer. It is fictional: keep the footer disclosure, the `noindex` meta tag, the 555 phone number, and the drawn (not real) map.

## Commands

Bun for installs and scripts.

- `bun run dev`: dev server with HMR at http://localhost:5173
- `bun run typecheck`: `react-router typegen` then `tsc` (TypeScript 7). Run after touching routes or loaders.
- `bun run test`: Vitest (`app/**/*.test.ts`)
- `bun run build` / `bun run start`: production build, served by `react-router-serve` (Node 22.22+)
- `bun run cms:setup`: builds the Contentful space (see below)

Env vars are in `.env.example`. The running site needs only the delivery token; the management token is for `cms:setup` and never goes to Railway. The Contentful organization has token access control on: a new personal access token answers `401 OrganizationAccessGrantRequired` until it is authorized under Settings > CMA tokens.

## Architecture

React Router 8 framework mode, SSR. A splat route (`app/routes/$.tsx`) serves every path; `app/routes/_index.tsx` re-exports it for `/`. Root (`app/root.tsx`) loads `siteSettings` for the banner, header, footer, and hours.

### The block bank (the core pattern)

A Contentful `page` has an ordered `sections` list; each section is a block entry. Data flows in one direction:

1. `app/models/page.server.ts` fetches the page (`include: 2`).
2. `app/models/blocks.server.ts` maps each section to a typed `Block` (union in `app/blocks/types.ts`). Each block type has a Zod field schema and a `build` function. Entries that fail validation, unknown types, and unresolved links are skipped, never thrown.
3. Data blocks fill themselves from shared collections through `BlockContext`: `tapList` reads every `beer` (by `status` and `tap`), `eventList` reads every `event` (`app/lib/events.ts` resolves weekly repeats and drops past ones), `menu` reads every `menuItem`. Each collection loads at most once per request.
4. `app/blocks/BlockRenderer.tsx` renders blocks through `app/blocks/registry.ts`. The registry is a mapped type, so a block type without a component, or a prop mismatch, fails `typecheck`.

Components never see raw Contentful entries. Contentful access lives only in `app/models/*.server.ts` via `getContentfulClient()` (`app/lib/contentful.server.ts`, which drops unresolvable links).

**Adding a block:** add its type to the `Block` union, a mapper in `blocks.server.ts`, a component in `app/blocks/` plus a registry entry, and its content type in `scripts/contentful/model.ts` (which also adds it to `page.sections` validation). Then create the content type in the space (by hand, or `cms:setup --reset` on a scratch environment).

### Contentful setup

`scripts/setup-contentful.ts` (`bun run cms:setup`) creates the 17 content types with editor help text and widgets (`scripts/contentful/model.ts`), uploads the photos in `scripts/contentful/images/`, and publishes the seed content (`scripts/contentful/content.ts`). It refuses to run on an environment that already has content types; `--reset` first deletes **every** entry, asset, and content type in that environment. Event dates in the seed are relative to the day it runs. Field ids in `model.ts` must match the Zod schemas in `app/models`.

### Styling

Tailwind 4 with `lone-star-ui` tokens re-tuned in `app/app.css` (oklch, `light-dark()` per token). `.dark` on `<html>` is set before paint by the script in `root.tsx` (saved choice, else system); the footer toggle switches "Daylight" and "After dark". Extra tokens: `ink`, `paper`/`night` (fixed tones over photos), and `beer-*` colors for the pint glasses. Fonts: Big Shoulders Display (display), Hanken Grotesk (body), Instrument Serif (italic accents). The brand motif is Texas road signage (`app/components/signage.tsx`): the Ranch Road route marker in the logo (route 8, a nod to React Router 8), the mile 8 marker post in the hero, the double yellow center line under the header, and the asphalt strip above the footer. Extra token `stripe` is the center-line yellow. Tones a CMS editor can pick are Limestone, Highway (sign green), and Rust.

Images go through `ContentfulImage` (`app/components/primitives.tsx`), which requests WebP sizes from the Contentful Images API.

## Skills

`.claude/skills/` and `.agents/skills/` mirror the same project skills, locked by `skills-lock.json`: `contentful-api` (REST reference for queries and the CMA), `react-router-framework-mode`, `frontend-design`, `agent-browser`. `scripts/ralph/` is the Ralph harness and is independent of the app.
