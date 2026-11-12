import { describe, expect, it } from 'vitest';
import type { EventItem } from '~/blocks/types';
import {
    formatEventWhen,
    nextWeeklyOccurrence,
    upcomingEvents,
    zoneOffsetMinutes
} from './events';

const HOUR = 60 * 60 * 1000;

function event(overrides: Partial<EventItem>): EventItem {
    return {
        id: overrides.title ?? 'e',
        title: 'Event',
        kind: 'Community',
        startsAt: '2026-11-14T19:00:00-06:00',
        repeatsWeekly: false,
        ...overrides
    };
}

describe('zoneOffsetMinutes', () => {
    it('knows Central standard and daylight time', () => {
        expect(zoneOffsetMinutes(new Date('2026-12-01T12:00:00Z'))).toBe(-360);
        expect(zoneOffsetMinutes(new Date('2026-07-01T12:00:00Z'))).toBe(-300);
    });
});

describe('nextWeeklyOccurrence', () => {
    const trivia = new Date('2026-11-11T19:00:00-06:00'); // a Wednesday

    it('returns the original date while it has not ended', () => {
        const now = new Date('2026-11-11T20:00:00-06:00');
        expect(nextWeeklyOccurrence(trivia, 2 * HOUR, now)).toEqual(trivia);
    });

    it('rolls forward to the next week once it ends', () => {
        const now = new Date('2026-11-11T21:30:00-06:00');
        expect(nextWeeklyOccurrence(trivia, 2 * HOUR, now).toISOString()).toBe(
            new Date('2026-11-18T19:00:00-06:00').toISOString()
        );
    });

    it('keeps the local start time across a daylight saving change', () => {
        const now = new Date('2027-03-20T12:00:00-05:00');
        const next = nextWeeklyOccurrence(trivia, 2 * HOUR, now);
        expect(next.toISOString()).toBe(
            new Date('2027-03-24T19:00:00-05:00').toISOString()
        );
        expect(formatEventWhen(next.toISOString()).time).toBe('7 pm');
    });
});

describe('upcomingEvents', () => {
    const now = new Date('2026-11-20T12:00:00-06:00');

    it('drops past one-offs, keeps recurring ones, and sorts soonest first', () => {
        const result = upcomingEvents(
            [
                event({ title: 'Past show', startsAt: '2026-11-14T19:00:00-06:00' }),
                event({ title: 'Release', startsAt: '2026-11-21T14:00:00-06:00' }),
                event({
                    title: 'Trivia',
                    startsAt: '2026-11-11T19:00:00-06:00',
                    endsAt: '2026-11-11T21:00:00-06:00',
                    repeatsWeekly: true
                })
            ],
            now
        );

        expect(result.map((e) => e.title)).toEqual(['Release', 'Trivia']);
        expect(result[1].startsAt).toBe(
            new Date('2026-11-25T19:00:00-06:00').toISOString()
        );
        expect(result[1].endsAt).toBe(
            new Date('2026-11-25T21:00:00-06:00').toISOString()
        );
    });

    it('applies the limit after sorting', () => {
        const result = upcomingEvents(
            [
                event({ title: 'B', startsAt: '2026-12-05T19:00:00-06:00' }),
                event({ title: 'A', startsAt: '2026-11-28T19:00:00-06:00' })
            ],
            now,
            1
        );
        expect(result.map((e) => e.title)).toEqual(['A']);
    });
});

describe('formatEventWhen', () => {
    it('shares the am/pm suffix inside a range', () => {
        expect(
            formatEventWhen('2026-11-14T19:00:00-06:00', '2026-11-14T22:00:00-06:00')
        ).toEqual({ day: 'Sat', date: 'Nov 14', time: '7 – 10 pm' });
    });

    it('keeps both suffixes when the range crosses noon', () => {
        expect(
            formatEventWhen('2026-11-15T11:00:00-06:00', '2026-11-15T15:30:00-06:00').time
        ).toBe('11 am – 3:30 pm');
    });
});
