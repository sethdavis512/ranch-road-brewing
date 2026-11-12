import { Badge } from 'lone-star-ui/badge';
import { Container, CtaLink, SectionHeading } from '~/components/primitives';
import { formatEventWhen } from '~/lib/events';
import type { EventKind, EventListBlock } from './types';

const kindBadge: Record<EventKind, 'longhorn' | 'bluebonnet' | 'prickly-pear' | 'outline'> = {
    'Live music': 'longhorn',
    Release: 'prickly-pear',
    Trivia: 'bluebonnet',
    Market: 'outline',
    Food: 'longhorn',
    Community: 'bluebonnet'
};

export function EventList({ heading, intro, events, emptyMessage, cta }: EventListBlock) {
    return (
        <section className="bg-mesa py-20 sm:py-28">
            <Container>
                <SectionHeading eyebrow="Out by the oaks" heading={heading} intro={intro}>
                    {cta && <CtaLink cta={cta} variant="outline" />}
                </SectionHeading>

                {events.length === 0 ? (
                    <p className="mt-12 max-w-xl font-serif text-2xl italic">{emptyMessage}</p>
                ) : (
                    <ol className="mt-12 grid gap-px bg-ink/20 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => {
                            const when = formatEventWhen(event.startsAt, event.endsAt);
                            return (
                                <li key={`${event.id}-${event.startsAt}`} className="flex flex-col gap-4 bg-mesa p-6 sm:p-7">
                                    <div className="flex items-start justify-between gap-4">
                                        <time dateTime={event.startsAt} className="leading-none">
                                            <span className="block font-serif text-2xl italic text-longhorn">{when.day}</span>
                                            <span className="block font-display text-6xl font-black uppercase">{when.date}</span>
                                        </time>
                                        <Badge variant={kindBadge[event.kind]}>{event.kind}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-display text-3xl leading-none font-black uppercase">{event.title}</h3>
                                        <p className="mt-2 text-sm font-semibold tracking-wider text-pecan uppercase">
                                            {event.repeatsWeekly ? `Every ${when.day} · ` : ''}
                                            {when.time}
                                        </p>
                                    </div>
                                    {event.description && <p className="text-pecan">{event.description}</p>}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </Container>
        </section>
    );
}
