import { cn } from 'lone-star-ui';
import { Container, ContentfulImage, CtaLink, Eyebrow, toneClasses } from '~/components/primitives';
import { RichTextBody } from '~/components/rich-text';
import type { FeatureSplitBlock } from './types';

export function FeatureSplit({ eyebrow, heading, body, image, imagePosition, cta, tone }: FeatureSplitBlock) {
    const onColor = tone !== 'limestone';

    return (
        <section className={cn('overflow-hidden', toneClasses[tone])}>
            <Container className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16">
                {image && (
                    <div className={cn('lg:col-span-6', imagePosition === 'left' ? 'lg:order-first lg:-ml-24' : 'lg:order-last lg:-mr-24')}>
                        <ContentfulImage image={image} sizes="(min-width: 1024px) 55vw, 100vw" aspect={5 / 4} className="aspect-5/4 w-full" />
                    </div>
                )}
                <div className={cn(image ? 'lg:col-span-6' : 'lg:col-span-8')}>
                    {eyebrow && <Eyebrow className={cn(onColor && 'text-current opacity-85')}>{eyebrow}</Eyebrow>}
                    <h2 className="font-display text-display font-black text-balance uppercase">{heading}</h2>
                    {body && <RichTextBody document={body} className={cn('mt-6 max-w-xl', onColor && '[&_a]:text-current')} />}
                    {cta && (
                        <div className="mt-9">
                            <CtaLink cta={cta} variant={onColor ? 'inverse' : 'primary'} />
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}
