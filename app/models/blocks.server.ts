import { z } from 'zod';
import type { Block, BlockType } from '~/blocks/types';
import { upcomingEvents } from '~/lib/events';
import { getBeers } from './beer.server';
import { getEvents } from './event.server';
import { getMenuItems, groupMenu } from './menu.server';
import {
    asset,
    entry,
    richText,
    toCta,
    toTone,
    warnSkipped
} from './parse.server';

/**
 * Shared data a page's blocks may need. Each loader runs at most once per
 * request, however many blocks on the page ask for it.
 */
export type BlockContext = {
    now: Date;
    beers: () => ReturnType<typeof getBeers>;
    events: () => ReturnType<typeof getEvents>;
    menu: () => ReturnType<typeof getMenuItems>;
};

function once<T>(load: () => Promise<T>) {
    let promise: Promise<T> | undefined;
    return () => (promise ??= load());
}

export function createBlockContext(now = new Date()): BlockContext {
    return {
        now,
        beers: once(getBeers),
        events: once(getEvents),
        menu: once(getMenuItems)
    };
}

type Mapper<K extends BlockType> = {
    schema: z.ZodType<{ sys: { id: string }; fields: unknown }>;
    build: (
        parsed: any,
        ctx: BlockContext
    ) => Promise<Extract<Block, { type: K }>> | Extract<Block, { type: K }>;
};

function mapper<K extends BlockType, S extends z.ZodRawShape>(
    fields: S,
    build: (
        parsed: z.infer<ReturnType<typeof entry<S>>>,
        ctx: BlockContext
    ) => Promise<Extract<Block, { type: K }>> | Extract<Block, { type: K }>
): Mapper<K> {
    return { schema: entry(fields), build };
}

const str = z.string();
const opt = z.string().optional();

/**
 * The server half of the block bank: for each Contentful block type, the
 * fields it must have and how to turn them into props. Blocks that list beers,
 * events, or menu items query those collections themselves, so staff edit a
 * beer once and every tap list on the site updates.
 */
const mappers: { [K in BlockType]: Mapper<K> } = {
    hero: mapper(
        {
            eyebrow: opt,
            heading: str,
            subheading: opt,
            image: asset.optional(),
            primaryCtaLabel: opt,
            primaryCtaHref: opt,
            secondaryCtaLabel: opt,
            secondaryCtaHref: opt,
            layout: opt
        },
        ({ sys, fields: f }) => ({
            type: 'hero',
            id: sys.id,
            eyebrow: f.eyebrow,
            heading: f.heading,
            subheading: f.subheading,
            image: f.image,
            primaryCta: toCta(f.primaryCtaLabel, f.primaryCtaHref),
            secondaryCta: toCta(f.secondaryCtaLabel, f.secondaryCtaHref),
            layout: f.layout === 'Split' ? 'split' : 'full-bleed'
        })
    ),

    factStrip: mapper({ facts: z.array(str) }, ({ sys, fields }) => ({
        type: 'factStrip',
        id: sys.id,
        facts: fields.facts.map((fact) => {
            const [value, label = ''] = fact.split('|').map((s) => s.trim());
            return { value, label };
        })
    })),

    tapList: mapper(
        {
            heading: str,
            intro: opt,
            showComingSoon: z.boolean().optional(),
            limit: z.number().optional(),
            ctaLabel: opt,
            ctaHref: opt
        },
        async ({ sys, fields: f }, ctx) => {
            const beers = await ctx.beers();
            const onTap = beers.filter((b) => b.status === 'On tap');
            const updatedAt = beers
                .map((b) => b.updatedAt)
                .filter(Boolean)
                .sort()
                .at(-1);
            return {
                type: 'tapList',
                id: sys.id,
                heading: f.heading,
                intro: f.intro,
                onTap: f.limit ? onTap.slice(0, f.limit) : onTap,
                comingSoon: f.showComingSoon
                    ? beers.filter((b) => b.status === 'Coming soon')
                    : [],
                updatedAt,
                cta: toCta(f.ctaLabel, f.ctaHref)
            };
        }
    ),

    eventList: mapper(
        {
            heading: str,
            intro: opt,
            limit: z.number().optional(),
            emptyMessage: opt,
            ctaLabel: opt,
            ctaHref: opt
        },
        async ({ sys, fields: f }, ctx) => ({
            type: 'eventList',
            id: sys.id,
            heading: f.heading,
            intro: f.intro,
            events: upcomingEvents(await ctx.events(), ctx.now, f.limit),
            emptyMessage:
                f.emptyMessage ?? 'Nothing on the calendar yet. Check back soon.',
            cta: toCta(f.ctaLabel, f.ctaHref)
        })
    ),

    menu: mapper(
        {
            heading: str,
            intro: opt,
            featuredOnly: z.boolean().optional(),
            ctaLabel: opt,
            ctaHref: opt
        },
        async ({ sys, fields: f }, ctx) => ({
            type: 'menu',
            id: sys.id,
            heading: f.heading,
            intro: f.intro,
            groups: groupMenu(await ctx.menu(), {
                featuredOnly: f.featuredOnly
            }),
            cta: toCta(f.ctaLabel, f.ctaHref)
        })
    ),

    featureSplit: mapper(
        {
            eyebrow: opt,
            heading: str,
            body: richText.optional(),
            image: asset.optional(),
            imagePosition: opt,
            ctaLabel: opt,
            ctaHref: opt,
            tone: opt
        },
        ({ sys, fields: f }) => ({
            type: 'featureSplit',
            id: sys.id,
            eyebrow: f.eyebrow,
            heading: f.heading,
            body: f.body,
            image: f.image,
            imagePosition: f.imagePosition === 'Left' ? 'left' : 'right',
            cta: toCta(f.ctaLabel, f.ctaHref),
            tone: toTone(f.tone)
        })
    ),

    richText: mapper({ heading: opt, body: richText }, ({ sys, fields }) => ({
        type: 'richText',
        id: sys.id,
        heading: fields.heading,
        body: fields.body
    })),

    visitInfo: mapper(
        { heading: str, body: opt, image: asset.optional() },
        ({ sys, fields }) => ({
            type: 'visitInfo',
            id: sys.id,
            heading: fields.heading,
            body: fields.body,
            image: fields.image
        })
    ),

    faq: mapper(
        {
            heading: str,
            items: z.array(
                z.object({
                    sys: z.object({ id: str }),
                    fields: z.object({ question: str, answer: str })
                })
            )
        },
        ({ sys, fields }) => ({
            type: 'faq',
            id: sys.id,
            heading: fields.heading,
            items: fields.items.map((item) => ({
                id: item.sys.id,
                ...item.fields
            }))
        })
    ),

    gallery: mapper(
        { heading: opt, caption: opt, images: z.array(asset) },
        ({ sys, fields }) => ({
            type: 'gallery',
            id: sys.id,
            heading: fields.heading,
            caption: fields.caption,
            images: fields.images
        })
    ),

    ctaBand: mapper(
        { heading: str, body: opt, ctaLabel: opt, ctaHref: opt, tone: opt },
        ({ sys, fields: f }) => ({
            type: 'ctaBand',
            id: sys.id,
            heading: f.heading,
            body: f.body,
            cta: toCta(f.ctaLabel, f.ctaHref),
            tone: toTone(f.tone)
        })
    )
};

function isBlockType(id: string | undefined): id is BlockType {
    return id !== undefined && id in mappers;
}

/**
 * Turns a page's raw `sections` into typed blocks, in order. Unknown content
 * types and entries that fail validation are skipped, so a half-built block
 * in the CMS never takes the page down.
 */
export async function toBlocks(
    sections: unknown[],
    ctx: BlockContext = createBlockContext()
): Promise<Block[]> {
    const blocks = await Promise.all(
        sections.map(async (section) => {
            const base = entry({}).safeParse(section);
            if (!base.success) return null;

            const typeId = base.data.sys.contentType?.sys.id;
            if (!isBlockType(typeId)) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(
                        `[content] No block registered for "${typeId}" (entry ${base.data.sys.id})`
                    );
                }
                return null;
            }

            const { schema, build } = mappers[typeId];
            const parsed = schema.safeParse(section);
            if (!parsed.success) {
                warnSkipped(typeId, base.data.sys.id, parsed.error);
                return null;
            }
            return build(parsed.data, ctx);
        })
    );

    return blocks.filter((block): block is Block => block !== null);
}
