import { Container, ContentfulImage, CtaLink, Eyebrow } from '~/components/primitives';
import { MileMarker } from '~/components/signage';
import type { HeroBlock } from './types';

export function Hero(block: HeroBlock) {
    return block.layout === 'split' || !block.image ? <SplitHero {...block} /> : <FullBleedHero {...block} />;
}

function FullBleedHero({ eyebrow, heading, subheading, image, primaryCta, secondaryCta }: HeroBlock) {
    return (
        <section className="relative isolate flex min-h-[72svh] items-end sm:min-h-[min(88svh,56rem)] overflow-hidden bg-night text-paper">
            {image && (
                <ContentfulImage image={image} sizes="100vw" priority className="absolute inset-0 -z-20 size-full" />
            )}
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-night via-night/55 to-night/25" />

            <MileMarker mile="8" className="absolute top-24 right-5 bottom-0 hidden sm:right-8 sm:flex lg:right-14" />

            <Container className="pt-28 pb-12 sm:pt-40 sm:pb-20">
                {eyebrow && <Eyebrow className="text-paper animate-rise">{eyebrow}</Eyebrow>}
                <h1 className="max-w-5xl font-display text-poster font-black text-balance uppercase sm:pr-24">
                    {heading.split(/(?<=[.,])\s+/).map((line, i) => (
                        <span key={line} className="animate-rise block" style={{ animationDelay: `${120 + i * 110}ms` }}>
                            {line}
                        </span>
                    ))}
                </h1>
                {subheading && (
                    <p className="animate-rise mt-7 max-w-xl text-lg sm:text-xl" style={{ animationDelay: '420ms' }}>
                        {subheading}
                    </p>
                )}
                {(primaryCta || secondaryCta) && (
                    <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '520ms' }}>
                        {primaryCta && <CtaLink cta={primaryCta} />}
                        {secondaryCta && <CtaLink cta={secondaryCta} variant="photo" />}
                    </div>
                )}
            </Container>
        </section>
    );
}

function SplitHero({ eyebrow, heading, subheading, image, primaryCta, secondaryCta }: HeroBlock) {
    return (
        <section className="overflow-hidden">
            <Container className="grid items-end gap-10 pt-14 pb-8 sm:pt-20 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                    {eyebrow && <Eyebrow className="animate-rise">{eyebrow}</Eyebrow>}
                    <h1 className="animate-rise font-display text-poster font-black text-balance uppercase" style={{ animationDelay: '100ms' }}>
                        {heading}
                    </h1>
                    {subheading && (
                        <p className="animate-rise mt-7 max-w-xl text-lg text-pecan sm:text-xl" style={{ animationDelay: '250ms' }}>
                            {subheading}
                        </p>
                    )}
                    {(primaryCta || secondaryCta) && (
                        <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '350ms' }}>
                            {primaryCta && <CtaLink cta={primaryCta} />}
                            {secondaryCta && <CtaLink cta={secondaryCta} variant="outline" />}
                        </div>
                    )}
                </div>
                {image && (
                    <div className="relative lg:col-span-5 lg:-mr-24 xl:-mr-40">
                        <ContentfulImage image={image} sizes="(min-width: 1024px) 50vw, 100vw" aspect={4 / 5} priority className="aspect-4/5 w-full" />
                        <span aria-hidden="true" className="absolute -bottom-4 -left-4 hidden h-24 w-24 bg-longhorn lg:block" />
                    </div>
                )}
            </Container>
        </section>
    );
}
