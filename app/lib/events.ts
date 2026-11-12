import type { EventItem } from '~/blocks/types';

/** Every date on the site is shown in the taproom's own time zone. */
export const TIME_ZONE = 'America/Chicago';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Offset of `TIME_ZONE` from UTC at the given instant, in minutes (e.g. -360). */
export function zoneOffsetMinutes(date: Date, timeZone = TIME_ZONE): number {
    const part = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset'
    })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value;

    const match = part?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

/**
 * The first weekly occurrence of an event that hasn't ended by `now`.
 * Keeps the local wall-clock time steady across daylight saving changes, so
 * "Trivia, Wednesdays at 7" stays at 7 in March and November.
 */
export function nextWeeklyOccurrence(
    startsAt: Date,
    durationMs: number,
    now: Date
): Date {
    if (startsAt.getTime() + durationMs > now.getTime()) return startsAt;

    const weeks = Math.ceil(
        (now.getTime() - durationMs - startsAt.getTime()) / WEEK_MS
    );
    let candidate = new Date(startsAt.getTime() + weeks * WEEK_MS);
    const drift = zoneOffsetMinutes(startsAt) - zoneOffsetMinutes(candidate);
    candidate = new Date(candidate.getTime() + drift * 60_000);

    if (candidate.getTime() + durationMs <= now.getTime()) {
        candidate = new Date(candidate.getTime() + WEEK_MS);
    }
    return candidate;
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

/**
 * Resolves recurring events to their next date, drops anything that has
 * already ended, and sorts soonest first.
 */
export function upcomingEvents(
    events: EventItem[],
    now: Date,
    limit?: number
): EventItem[] {
    const resolved = events.flatMap((event) => {
        const start = new Date(event.startsAt);
        const end = event.endsAt ? new Date(event.endsAt) : undefined;
        const duration = end
            ? end.getTime() - start.getTime()
            : DEFAULT_DURATION_MS;

        if (event.repeatsWeekly) {
            const next = nextWeeklyOccurrence(start, duration, now);
            return [
                {
                    ...event,
                    startsAt: next.toISOString(),
                    endsAt: end
                        ? new Date(next.getTime() + duration).toISOString()
                        : undefined
                }
            ];
        }

        return start.getTime() + duration > now.getTime() ? [event] : [];
    });

    resolved.sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
    return limit ? resolved.slice(0, limit) : resolved;
}

const dayFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short'
});
const dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    month: 'short',
    day: 'numeric'
});
const timeFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit'
});

function formatTime(date: Date) {
    return timeFormat
        .format(date)
        .replace(':00', '')
        .replace(' AM', ' am')
        .replace(' PM', ' pm');
}

/** `{ day: 'Sat', date: 'Nov 14', time: '7 – 10 pm' }` in taproom time. */
export function formatEventWhen(startsAt: string, endsAt?: string) {
    const start = new Date(startsAt);
    let time = formatTime(start);
    if (endsAt) {
        const end = formatTime(new Date(endsAt));
        const sameHalf = time.slice(-2) === end.slice(-2);
        time = `${sameHalf ? time.slice(0, -3) : time} – ${end}`;
    }
    return { day: dayFormat.format(start), date: dateFormat.format(start), time };
}

const stampFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
});

/** "Thu, Nov 12" in taproom time. */
export function formatStamp(iso: string) {
    return stampFormat.format(new Date(iso));
}
