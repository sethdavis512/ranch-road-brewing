import type { Document } from '@contentful/rich-text-types';
import { z } from 'zod';
import type { Cta, Image } from '~/blocks/types';

/**
 * Zod schemas for raw Contentful shapes. Every model maps entries through
 * these, so CMS drift (a renamed field, an empty required field) is caught at
 * the edge and the block is skipped instead of crashing the page.
 */

export const asset = z
    .object({
        fields: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            file: z.object({
                url: z.string(),
                details: z
                    .object({
                        image: z
                            .object({ width: z.number(), height: z.number() })
                            .optional()
                    })
                    .optional()
            })
        })
    })
    .transform(
        ({ fields }): Image => ({
            url: fields.file.url.startsWith('//')
                ? `https:${fields.file.url}`
                : fields.file.url,
            width: fields.file.details?.image?.width ?? 1600,
            height: fields.file.details?.image?.height ?? 900,
            alt: fields.description ?? fields.title ?? ''
        })
    );

export const richText = z.custom<Document>(
    (value) =>
        typeof value === 'object' &&
        value !== null &&
        (value as { nodeType?: string }).nodeType === 'document'
);

export const entry = <T extends z.ZodRawShape>(fields: T) =>
    z.object({
        sys: z.object({
            id: z.string(),
            updatedAt: z.string().optional(),
            contentType: z
                .object({ sys: z.object({ id: z.string() }) })
                .optional()
        }),
        fields: z.object(fields)
    });

export function toCta(label?: string, href?: string): Cta | undefined {
    return label && href ? { label, href } : undefined;
}

export function toTone(value?: string) {
    switch (value) {
        case 'Highway':
            return 'highway' as const;
        case 'Rust':
            return 'rust' as const;
        default:
            return 'limestone' as const;
    }
}

export function warnSkipped(what: string, id: string, error: z.ZodError) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`[content] Skipped ${what} ${id}: ${z.prettifyError(error)}`);
    }
}
