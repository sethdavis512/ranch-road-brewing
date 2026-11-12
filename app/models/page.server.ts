import { z } from 'zod';
import type { Page } from '~/blocks/types';
import { getContentfulClient } from '~/lib/contentful.server';
import { createBlockContext, toBlocks } from './blocks.server';
import { asset, entry } from './parse.server';

const pageEntry = entry({
    title: z.string(),
    slug: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: asset.optional(),
    sections: z.array(z.unknown()).optional()
});

/**
 * A published `page` by slug, with its sections mapped to typed blocks.
 * `include: 2` resolves the sections (level 1) and links inside them, such as
 * an FAQ's questions or a hero's image (level 2). Returns `null` when no
 * published page has the slug.
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
    const response = await getContentfulClient().getEntries({
        content_type: 'page',
        'fields.slug': slug,
        include: 2,
        limit: 1
    });

    const parsed = pageEntry.safeParse(response.items[0]);
    if (!parsed.success) return null;
    const { sys, fields } = parsed.data;

    return {
        id: sys.id,
        slug: fields.slug,
        title: fields.title,
        seoTitle: fields.seoTitle,
        seoDescription: fields.seoDescription,
        ogImage: fields.ogImage,
        blocks: await toBlocks(fields.sections ?? [], createBlockContext())
    };
}
