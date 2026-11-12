import { Container, CtaLink, SectionHeading } from '~/components/primitives';
import { MENU_TAGS, type MenuBlock, type MenuTag } from './types';

const tagMarks: Record<MenuTag, string> = {
    Vegetarian: 'V',
    Vegan: 'VG',
    'Gluten-free': 'GF',
    Spicy: 'Hot'
};

const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function Menu({ heading, intro, groups, cta }: MenuBlock) {
    const used = new Set(groups.flatMap((g) => g.items.flatMap((i) => i.tags)));
    const usedTags = MENU_TAGS.filter((tag) => used.has(tag));

    return (
        <section className="py-20 sm:py-28">
            <Container>
                <SectionHeading eyebrow="From the smoker" heading={heading} intro={intro}>
                    {cta && <CtaLink cta={cta} variant="outline" />}
                </SectionHeading>

                <div className="mt-12 columns-1 gap-14 md:columns-2">
                    {groups.map((group) => (
                        <section key={group.category} className="mb-12 break-inside-avoid">
                            <h3 className="flex items-center gap-4 font-display text-3xl font-black uppercase">
                                {group.category}
                                <span aria-hidden="true" className="h-0.5 flex-1 bg-ink" />
                            </h3>
                            <ul className="mt-5 space-y-5">
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <p className="flex items-baseline gap-3">
                                            <span className="text-lg font-bold">{item.name}</span>
                                            {item.tags.map((tag) => (
                                                <abbr key={tag} title={tag} className="text-xs font-bold text-bluebonnet no-underline">
                                                    {tagMarks[tag]}
                                                </abbr>
                                            ))}
                                            <span aria-hidden="true" className="mb-1 flex-1 border-b-2 border-dotted border-ink/35" />
                                            <span className="font-display text-2xl font-black tabular-nums">{price.format(item.price)}</span>
                                        </p>
                                        {item.description && <p className="mt-1 max-w-md text-pecan">{item.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                {usedTags.length > 0 && (
                    <p className="text-sm text-pecan">
                        {usedTags.map((tag, i) => (
                            <span key={tag}>
                                {i > 0 && ' · '}
                                <span className="font-bold text-bluebonnet">{tagMarks[tag]}</span> {tag.toLowerCase()}
                            </span>
                        ))}
                    </p>
                )}
            </Container>
        </section>
    );
}
