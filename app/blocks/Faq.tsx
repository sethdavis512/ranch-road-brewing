import {
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger
} from 'lone-star-ui/accordion';
import { Container } from '~/components/primitives';
import type { FaqBlock } from './types';

export function Faq({ heading, items }: FaqBlock) {
    return (
        <section className="py-20 sm:py-28">
            <Container className="grid gap-10 lg:grid-cols-12">
                <h2 className="font-display text-display font-black uppercase lg:col-span-4">{heading}</h2>
                <AccordionRoot className="border-t-2 border-ink lg:col-span-8">
                    {items.map((item) => (
                        <AccordionItem key={item.id} className="border-b-2 border-ink">
                            <AccordionHeader>
                                <AccordionTrigger className="min-h-16 gap-6 py-4 font-display text-2xl font-extrabold text-ink uppercase hover:text-longhorn [&>svg]:size-6 [&>svg]:text-longhorn">
                                    {item.question}
                                </AccordionTrigger>
                            </AccordionHeader>
                            <AccordionPanel className="text-base text-pecan">
                                <p className="max-w-2xl pb-6 text-lg">{item.answer}</p>
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </AccordionRoot>
            </Container>
        </section>
    );
}
