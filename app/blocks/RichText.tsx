import { Container } from '~/components/primitives';
import { RichTextBody } from '~/components/rich-text';
import type { RichTextBlock } from './types';

export function RichText({ heading, body }: RichTextBlock) {
    return (
        <section className="py-16 sm:py-20">
            <Container className="grid gap-8 lg:grid-cols-12">
                {heading && (
                    <h2 className="font-display text-title font-black uppercase lg:col-span-4">{heading}</h2>
                )}
                <RichTextBody document={body} className="max-w-2xl lg:col-span-7 lg:col-start-5" />
            </Container>
        </section>
    );
}
