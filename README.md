# Ranch Road Brewing Co.

A concept site for a fictional Hill Country taproom, built to show what a small business gets from a headless CMS: the brewery changes the tap list, posts events, edits the menu, and builds new pages in Contentful, and the site keeps up on its own.

Built with React Router 8 (SSR), Contentful, Tailwind 4, and [lone-star-ui](https://github.com/sethdavis512/lone-star-ui).

## What it does

- **Pages from blocks.** Every page is an ordered list of blocks (hero, tap list, events, menu, feature, FAQ, gallery, and more) arranged in Contentful.
- **Content that maintains itself.** Flip a beer to "On tap" and every tap list updates. Events drop off once they end, and weekly events roll forward on their own.
- **Safe to edit.** Each block is validated with Zod on the server; a half-finished entry is skipped instead of breaking the page.
- **Built for editors.** The content model ships with help text, dropdowns, and date pickers, created by a setup script.

## Run it

```bash
bun install
cp .env.example .env   # add your Contentful space id and tokens
bun run cms:setup      # create the content model and seed content in an empty space
bun run dev
```

```bash
bun run typecheck
bun run test
bun run build && bun run start
```

Deploys with the included Dockerfile (Bun build, Node 24 runtime).

---

Ranch Road Brewing Co. is not a real brewery. A concept by [Tech with Seth](https://techwithseth.com).
