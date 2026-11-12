import { z } from 'zod';
import { EVENT_KINDS, type EventItem } from '~/blocks/types';
import { getContentfulClient } from '~/lib/contentful.server';
import { entry, warnSkipped } from './parse.server';

const eventEntry = entry({
    title: z.string(),
    kind: z.enum(EVENT_KINDS),
    startsAt: z.string(),
    endsAt: z.string().optional(),
    description: z.string().optional(),
    repeatsWeekly: z.boolean().optional()
});

/**
 * Every published event. Staff add events in Contentful and they appear on
 * any page with an event list; nothing has to be wired by hand. Filtering to
 * upcoming dates happens in `upcomingEvents` (app/lib/events.ts).
 */
export async function getEvents(): Promise<EventItem[]> {
    const response = await getContentfulClient().getEntries({
        content_type: 'event',
        order: ['fields.startsAt'],
        limit: 200
    });

    return response.items.flatMap((item) => {
        const parsed = eventEntry.safeParse(item);
        if (!parsed.success) {
            warnSkipped('event', item.sys.id, parsed.error);
            return [];
        }
        const { sys, fields } = parsed.data;
        return [
            {
                id: sys.id,
                title: fields.title,
                kind: fields.kind,
                startsAt: fields.startsAt,
                endsAt: fields.endsAt,
                description: fields.description,
                repeatsWeekly: fields.repeatsWeekly ?? false
            }
        ];
    });
}
