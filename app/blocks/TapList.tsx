import { Badge } from 'lone-star-ui/badge';
import { cn } from 'lone-star-ui';
import { AbvMeter } from '~/components/signage';
import { Container, CtaLink, SectionHeading } from '~/components/primitives';
import { formatStamp } from '~/lib/events';
import type { Beer, BeerColor, TapListBlock } from './types';

const beerFill: Record<BeerColor, string> = {
    straw: 'fill-beer-straw',
    gold: 'fill-beer-gold',
    amber: 'fill-beer-amber',
    copper: 'fill-beer-copper',
    ruby: 'fill-beer-ruby',
    brown: 'fill-beer-brown',
    black: 'fill-beer-black'
};

function PintGlass({ color }: { color: BeerColor }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 32 44" className="h-14 w-10 shrink-0">
            <path d="M3 2h26l-3 40H6z" className={beerFill[color]} />
            <path d="M3 2h26l-.6 7H3.6z" className="fill-paper" />
            <path d="M3 2h26l-3 40H6z" fill="none" className="stroke-ink" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
    );
}

function TapRow({ beer, index }: { beer: Beer & { tap?: number }; index: number }) {
    const tap = String(beer.tap ?? index + 1).padStart(2, '0');

    return (
        <li className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-4 border-t-2 border-ink py-6 sm:grid-cols-[3.5rem_auto_1fr_auto] sm:items-center sm:gap-x-6">
            <span className="hidden font-display text-4xl font-black text-pecan tabular-nums sm:block">{tap}</span>
            <PintGlass color={beer.color} />
            <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-title font-black uppercase">{beer.name}</h3>
                    {beer.isNew && <Badge variant="prickly-pear">New</Badge>}
                </div>
                <p className="font-serif text-xl italic text-longhorn">{beer.style}</p>
                {beer.description && <p className="mt-2 max-w-2xl text-pecan">{beer.description}</p>}
                {beer.formats.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-1.5">
                        {beer.formats.map((format) => (
                            <span key={format} className="border border-ink/30 px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
                                {format}
                            </span>
                        ))}
                    </p>
                )}
            </div>
            <div className="col-span-2 flex items-end gap-6 sm:col-span-1 sm:justify-end">
                <AbvMeter abv={beer.abv} />
                {beer.ibu !== undefined && (
                    <p className="leading-none">
                        <span className="block font-display text-3xl font-black tabular-nums">{beer.ibu}</span>
                        <span className="text-xs font-semibold tracking-widest text-pecan uppercase">IBU</span>
                    </p>
                )}
            </div>
        </li>
    );
}

export function TapList({ heading, intro, onTap, comingSoon, updatedAt, cta }: TapListBlock) {
    return (
        <section className="py-20 sm:py-28">
            <Container>
                <SectionHeading eyebrow="On tap now" heading={heading} intro={intro}>
                    {updatedAt && (
                        <p className="flex items-center gap-2 text-sm font-semibold tracking-wider text-pecan uppercase">
                            <span aria-hidden="true" className="size-2 rounded-full bg-bluebonnet" />
                            Board updated {formatStamp(updatedAt)}
                        </p>
                    )}
                </SectionHeading>

                {onTap.length > 0 ? (
                    <ol className="mt-12 border-b-2 border-ink">
                        {onTap.map((beer, i) => (
                            <TapRow key={beer.id} beer={beer} index={i} />
                        ))}
                    </ol>
                ) : (
                    <p className="mt-12 border-y-2 border-ink py-10 font-serif text-2xl italic">
                        Every line is being cleaned. Fresh kegs go on at opening.
                    </p>
                )}

                {comingSoon.length > 0 && (
                    <div className="mt-14 grid gap-6 lg:grid-cols-12">
                        <h3 className="font-display text-3xl font-black uppercase lg:col-span-3">In the tanks</h3>
                        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-9">
                            {comingSoon.map((beer) => (
                                <li key={beer.id} className={cn('flex gap-4 bg-mesa p-5')}>
                                    <PintGlass color={beer.color} />
                                    <div>
                                        <p className="font-display text-2xl font-black uppercase">{beer.name}</p>
                                        <p className="font-serif text-lg italic text-longhorn">
                                            {beer.style} · {beer.abv.toFixed(1)}%
                                        </p>
                                        {beer.description && <p className="mt-1 text-sm text-pecan">{beer.description}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {cta && (
                    <div className="mt-10">
                        <CtaLink cta={cta} variant="outline" />
                    </div>
                )}
            </Container>
        </section>
    );
}
