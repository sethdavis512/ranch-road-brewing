import { z } from 'zod';
import { BEER_COLORS, BEER_STATUSES, type Beer } from '~/blocks/types';
import { getContentfulClient } from '~/lib/contentful.server';
import { entry, warnSkipped } from './parse.server';

const beerEntry = entry({
    name: z.string(),
    style: z.string(),
    abv: z.number(),
    ibu: z.number().optional(),
    description: z.string().optional(),
    color: z.enum(BEER_COLORS),
    status: z.enum(BEER_STATUSES),
    tap: z.number().optional(),
    isNew: z.boolean().optional(),
    formats: z.array(z.string()).optional()
});

export type BoardBeer = Beer & { tap?: number; updatedAt?: string };

/** Every beer that isn't retired, in tap-handle order. */
export async function getBeers(): Promise<BoardBeer[]> {
    const response = await getContentfulClient().getEntries({
        content_type: 'beer',
        'fields.status[ne]': 'Off',
        limit: 100
    });

    const beers = response.items.flatMap((item) => {
        const parsed = beerEntry.safeParse(item);
        if (!parsed.success) {
            warnSkipped('beer', item.sys.id, parsed.error);
            return [];
        }
        const { sys, fields } = parsed.data;
        return [
            {
                id: sys.id,
                updatedAt: sys.updatedAt,
                name: fields.name,
                style: fields.style,
                abv: fields.abv,
                ibu: fields.ibu,
                description: fields.description,
                color: fields.color,
                status: fields.status,
                tap: fields.tap,
                isNew: fields.isNew ?? false,
                formats: fields.formats ?? []
            }
        ];
    });

    return beers.sort((a, b) => (a.tap ?? 99) - (b.tap ?? 99));
}
