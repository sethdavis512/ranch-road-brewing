import { z } from 'zod';
import type { HoursRow, SiteSettings } from '~/blocks/types';
import { getContentfulClient } from '~/lib/contentful.server';
import { entry, toTone } from './parse.server';

const navPage = z.object({
    fields: z.object({
        slug: z.string(),
        title: z.string(),
        navLabel: z.string().optional()
    })
});

const settingsEntry = entry({
    name: z.string(),
    tagline: z.string(),
    announcement: z.string().optional(),
    announcementTone: z.string().optional(),
    address: z.string(),
    phone: z.string().optional(),
    hours: z.array(z.string()).optional(),
    navigation: z.array(navPage).optional()
});

/** Hours are typed by staff as "Wed – Thu | 3 pm – 10 pm". */
export function parseHours(lines: string[]): HoursRow[] {
    return lines.flatMap((line) => {
        const [days, hours] = line.split('|').map((part) => part.trim());
        return days && hours ? [{ days, hours }] : [];
    });
}

const FALLBACK: SiteSettings = {
    name: 'Ranch Road Brewing Co.',
    tagline: 'Cold beer, mile eight.',
    announcementTone: 'limestone',
    address: '',
    hours: [],
    navigation: []
};

/**
 * The one `siteSettings` entry: brand, banner, hours, and navigation. Lives in
 * the CMS so staff can post "crossing's closed, use the north gate" without a
 * deploy. Falls back to a bare shell if the entry is missing or invalid.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
    const response = await getContentfulClient().getEntries({
        content_type: 'siteSettings',
        include: 1,
        limit: 1
    });

    const parsed = settingsEntry.safeParse(response.items[0]);
    if (!parsed.success) return FALLBACK;
    const { fields } = parsed.data;

    return {
        name: fields.name,
        tagline: fields.tagline,
        announcement: fields.announcement,
        announcementTone: toTone(fields.announcementTone),
        address: fields.address,
        phone: fields.phone,
        hours: parseHours(fields.hours ?? []),
        navigation: (fields.navigation ?? []).map(({ fields: page }) => ({
            label: page.navLabel ?? page.title,
            href: page.slug === 'home' ? '/' : `/${page.slug}`
        }))
    };
}
