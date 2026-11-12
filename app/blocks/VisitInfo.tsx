import { useRouteLoaderData } from 'react-router';
import { Container, ContentfulImage, Eyebrow } from '~/components/primitives';
import type { loader as rootLoader } from '~/root';
import type { VisitInfoBlock } from './types';

/** Not to scale. A drawn map, so nobody mistakes the concept for a real address. */
function CrossingMap() {
    return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Sketch map: the taproom sits at mile 8 on the ranch road, just past the creek crossing, with an all-weather north gate off the county road" className="h-auto w-full">
            <rect width="320" height="220" className="fill-mesa" />
            {/* Creek */}
            <path d="M210 -10 C 190 60, 250 110, 220 160 S 230 210, 250 230" className="fill-none stroke-sky" strokeWidth="18" strokeLinecap="round" />
            {/* Ranch road, with its center line */}
            <path d="M-10 150 C 80 150, 140 120, 330 128" className="fill-none stroke-ink" strokeWidth="12" />
            <path d="M-10 150 C 80 150, 140 120, 330 128" className="fill-none stroke-stripe" strokeWidth="1.5" strokeDasharray="8 7" />
            {/* County road to the north gate */}
            <path d="M120 140 L120 -10" className="fill-none stroke-ink" strokeWidth="6" />
            <rect x="132" y="66" width="58" height="36" className="fill-longhorn" />
            <text x="139" y="89" className="fill-surface font-display text-[13px] font-black uppercase">Taproom</text>
            <rect x="208" y="122" width="26" height="14" className="fill-paper stroke-ink" strokeWidth="2" />
            <text x="244" y="168" className="fill-ink font-serif text-[13px] italic">the crossing</text>
            <text x="128" y="24" className="fill-ink font-serif text-[13px] italic">north gate</text>
            <circle cx="120" cy="34" r="5" className="fill-ink" />
            {/* Mile 8 marker */}
            <rect x="60" y="160" width="22" height="26" rx="2" className="fill-sign" />
            <text x="66" y="179" className="fill-paper font-display text-[15px] font-black">8</text>
            <text x="20" y="206" className="fill-ink font-serif text-[13px] italic">mile 8, ranch road</text>
        </svg>
    );
}

export function VisitInfo({ heading, body, image }: VisitInfoBlock) {
    const settings = useRouteLoaderData<typeof rootLoader>('root')?.settings;

    return (
        <section className="py-20 sm:py-28">
            <Container className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <Eyebrow>Plan a visit</Eyebrow>
                    <h2 className="font-display text-display font-black uppercase">{heading}</h2>
                    {body && <p className="mt-6 max-w-md text-lg whitespace-pre-line text-pecan">{body}</p>}

                    {settings && (
                        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                            <dl>
                                {settings.hours.map((row) => (
                                    <div key={row.days} className="flex justify-between gap-4 border-t-2 border-ink py-2.5 last:border-b-2">
                                        <dt className="font-display text-xl font-extrabold uppercase">{row.days}</dt>
                                        <dd className="tabular-nums">{row.hours}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div>
                                <address className="text-lg not-italic whitespace-pre-line">{settings.address}</address>
                                {settings.phone && (
                                    <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="mt-1 inline-block font-semibold text-longhorn underline underline-offset-4">
                                        {settings.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 lg:col-span-7">
                    <div className="border-2 border-ink">
                        <CrossingMap />
                    </div>
                    {image && <ContentfulImage image={image} sizes="(min-width: 1024px) 55vw, 100vw" aspect={16 / 9} className="aspect-video w-full" />}
                </div>
            </Container>
        </section>
    );
}
