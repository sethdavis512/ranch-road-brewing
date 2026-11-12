import { describe, expect, it, vi } from 'vitest';
import type { BlockContext } from './blocks.server';
import { toBlocks } from './blocks.server';

function section(type: string, id: string, fields: Record<string, unknown>) {
    return { sys: { id, contentType: { sys: { id: type } } }, fields };
}

const beer = (id: string, status: string, tap?: number, updatedAt = '2026-11-10T12:00:00Z') => ({
    id,
    updatedAt,
    name: id,
    style: 'Lager',
    abv: 5,
    color: 'gold' as const,
    status: status as 'On tap',
    tap,
    isNew: false,
    formats: []
});

function context(): BlockContext {
    return {
        now: new Date('2026-11-20T12:00:00-06:00'),
        beers: vi.fn(async () => [
            beer('a', 'On tap', 1),
            beer('b', 'On tap', 2, '2026-11-12T15:00:00Z'),
            beer('c', 'Coming soon')
        ]),
        events: vi.fn(async () => [
            { id: 'past', title: 'Past', kind: 'Trivia' as const, startsAt: '2026-11-01T19:00:00-06:00', repeatsWeekly: false },
            { id: 'next', title: 'Next', kind: 'Release' as const, startsAt: '2026-11-21T14:00:00-06:00', repeatsWeekly: false }
        ]),
        menu: vi.fn(async () => [])
    };
}

describe('toBlocks', () => {
    it('maps sections in order and skips unknown or invalid ones', async () => {
        const blocks = await toBlocks(
            [
                section('hero', 'h1', { heading: 'Cold beer', layout: 'Split', primaryCtaLabel: 'Go', primaryCtaHref: '/beer' }),
                section('mysteryBlock', 'm1', { anything: true }),
                section('ctaBand', 'c1', { body: 'Missing its required heading' }),
                { sys: { type: 'Link', linkType: 'Entry', id: 'unresolved' } },
                section('factStrip', 'f1', { facts: ['8 | taps', 'Dogs | welcome'] })
            ],
            context()
        );

        expect(blocks.map((b) => b.id)).toEqual(['h1', 'f1']);
        expect(blocks[0]).toMatchObject({ type: 'hero', layout: 'split', primaryCta: { label: 'Go', href: '/beer' } });
        expect(blocks[1]).toMatchObject({ facts: [{ value: '8', label: 'taps' }, { value: 'Dogs', label: 'welcome' }] });
    });

    it('fills data blocks from the shared collections', async () => {
        const ctx = context();
        const blocks = await toBlocks(
            [
                section('tapList', 't1', { heading: 'Board', limit: 1, showComingSoon: true }),
                section('tapList', 't2', { heading: 'Board again' }),
                section('eventList', 'e1', { heading: 'Events' })
            ],
            ctx
        );

        expect(blocks[0]).toMatchObject({
            onTap: [{ id: 'a' }],
            comingSoon: [{ id: 'c' }],
            updatedAt: '2026-11-12T15:00:00Z'
        });
        expect(blocks[1]).toMatchObject({ comingSoon: [] });
        expect(blocks[2]).toMatchObject({ events: [{ id: 'next' }] });
    });
});
