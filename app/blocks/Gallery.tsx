import { cn } from 'lone-star-ui';
import { Container, ContentfulImage } from '~/components/primitives';
import type { GalleryBlock } from './types';

/** One large lead photo, the rest stepping down beside it. */
const spans = ['md:col-span-7 md:row-span-2', 'md:col-span-5', 'md:col-span-5', 'md:col-span-6', 'md:col-span-6'];

export function Gallery({ heading, caption, images }: GalleryBlock) {
    return (
        <section className="py-20 sm:py-24">
            <Container>
                {heading && <h2 className="mb-10 font-display text-display font-black uppercase">{heading}</h2>}
                <div className="grid gap-3 md:grid-flow-dense md:auto-rows-[16rem] md:grid-cols-12">
                    {images.map((image, i) => (
                        <figure key={image.url} className={cn('relative aspect-4/3 overflow-hidden md:aspect-auto', spans[i % spans.length])}>
                            <ContentfulImage
                                image={image}
                                sizes={i === 0 ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 42vw, 100vw'}
                                className="size-full transition-transform duration-700 ease-out-quint hover:scale-[1.03]"
                            />
                        </figure>
                    ))}
                </div>
                {caption && <p className="mt-5 max-w-xl font-serif text-xl italic text-pecan">{caption}</p>}
            </Container>
        </section>
    );
}
