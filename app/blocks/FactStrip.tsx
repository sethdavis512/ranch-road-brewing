import { Container } from '~/components/primitives';
import type { FactStripBlock } from './types';

export function FactStrip({ facts }: FactStripBlock) {
    return (
        <section aria-label="At a glance" className="border-y-2 border-ink">
            <Container>
                <dl className="grid grid-cols-2 lg:grid-cols-4">
                    {facts.map((fact, i) => (
                        <div
                            key={fact.value + fact.label}
                            className="flex flex-col-reverse gap-1 border-ink/20 py-7 pr-4 not-first:pl-4 max-lg:odd:pl-0 max-lg:even:border-l max-lg:nth-[n+3]:border-t lg:not-first:border-l lg:not-first:pl-8"
                        >
                            <dt className="text-sm font-semibold tracking-widest text-pecan uppercase">{fact.label}</dt>
                            <dd className={i % 2 ? 'font-serif text-5xl italic' : 'font-display text-6xl font-black uppercase'}>
                                {fact.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Container>
        </section>
    );
}
