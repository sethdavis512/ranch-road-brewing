import { cn } from 'lone-star-ui';
import { Container, CtaLink, toneClasses } from '~/components/primitives';
import type { CtaBandBlock } from './types';

export function CtaBand({ heading, body, cta, tone }: CtaBandBlock) {
    return (
        <section className={cn('relative overflow-hidden', toneClasses[tone])}>
            {/* Road-sign hazard stripes running off the edge of the band. */}
            <div
                aria-hidden="true"
                className="absolute inset-y-0 right-0 hidden w-40 opacity-25 lg:block"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg, currentColor 0 22px, transparent 22px 44px)' }}
            />
            <Container className="relative flex flex-col items-start gap-8 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:pr-48">
                <div className="max-w-3xl">
                    <h2 className="font-display text-display font-black text-balance uppercase">{heading}</h2>
                    {body && <p className="mt-5 max-w-xl text-lg opacity-90">{body}</p>}
                </div>
                {cta && <CtaLink cta={cta} variant={tone === 'limestone' ? 'primary' : 'inverse'} className="shrink-0" />}
            </Container>
        </section>
    );
}
