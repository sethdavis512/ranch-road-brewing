import type { Document } from '@contentful/rich-text-types';

/**
 * Clean, serializable shapes for everything the page components render.
 * Raw Contentful entries never reach a component: `app/models/*.server.ts`
 * parses them with Zod and maps them to these types first.
 */

export type Image = {
    url: string;
    width: number;
    height: number;
    alt: string;
};

export type Cta = {
    label: string;
    href: string;
};

export type Tone = 'limestone' | 'highway' | 'rust';

export const BEER_COLORS = [
    'straw',
    'gold',
    'amber',
    'copper',
    'ruby',
    'brown',
    'black'
] as const;
export type BeerColor = (typeof BEER_COLORS)[number];

export const BEER_STATUSES = ['On tap', 'Coming soon', 'Off'] as const;
export type BeerStatus = (typeof BEER_STATUSES)[number];

export type Beer = {
    id: string;
    name: string;
    style: string;
    abv: number;
    ibu?: number;
    description?: string;
    color: BeerColor;
    status: BeerStatus;
    /** Tap handle number on the bar, which also orders the board. */
    tap?: number;
    isNew: boolean;
    formats: string[];
};

export const EVENT_KINDS = [
    'Live music',
    'Release',
    'Trivia',
    'Market',
    'Food',
    'Community'
] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export type EventItem = {
    id: string;
    title: string;
    kind: EventKind;
    /** ISO timestamp of the next (or only) occurrence. */
    startsAt: string;
    endsAt?: string;
    description?: string;
    repeatsWeekly: boolean;
};

export const MENU_CATEGORIES = [
    'Snacks',
    'Tacos',
    'Plates',
    'Sweets',
    'Kids'
] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const MENU_TAGS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Spicy'] as const;
export type MenuTag = (typeof MENU_TAGS)[number];

export type MenuItem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: MenuCategory;
    tags: MenuTag[];
};

export type MenuGroup = {
    category: MenuCategory;
    items: MenuItem[];
};

export type HoursRow = {
    days: string;
    hours: string;
};

export type SiteSettings = {
    name: string;
    tagline: string;
    announcement?: string;
    announcementTone: Tone;
    address: string;
    phone?: string;
    hours: HoursRow[];
    navigation: { label: string; href: string }[];
};

/* ---------------------------------------------------------------- blocks */

type BlockBase<T extends string> = { type: T; id: string };

export type HeroBlock = BlockBase<'hero'> & {
    eyebrow?: string;
    heading: string;
    subheading?: string;
    image?: Image;
    primaryCta?: Cta;
    secondaryCta?: Cta;
    layout: 'full-bleed' | 'split';
};

export type FactStripBlock = BlockBase<'factStrip'> & {
    facts: { value: string; label: string }[];
};

export type TapListBlock = BlockBase<'tapList'> & {
    heading: string;
    intro?: string;
    onTap: Beer[];
    comingSoon: Beer[];
    /** ISO timestamp of the most recently edited beer on the board. */
    updatedAt?: string;
    cta?: Cta;
};

export type EventListBlock = BlockBase<'eventList'> & {
    heading: string;
    intro?: string;
    events: EventItem[];
    emptyMessage: string;
    cta?: Cta;
};

export type MenuBlock = BlockBase<'menu'> & {
    heading: string;
    intro?: string;
    groups: MenuGroup[];
    cta?: Cta;
};

export type FeatureSplitBlock = BlockBase<'featureSplit'> & {
    eyebrow?: string;
    heading: string;
    body?: Document;
    image?: Image;
    imagePosition: 'left' | 'right';
    cta?: Cta;
    tone: Tone;
};

export type RichTextBlock = BlockBase<'richText'> & {
    heading?: string;
    body: Document;
};

export type VisitInfoBlock = BlockBase<'visitInfo'> & {
    heading: string;
    body?: string;
    image?: Image;
};

export type FaqBlock = BlockBase<'faq'> & {
    heading: string;
    items: { id: string; question: string; answer: string }[];
};

export type GalleryBlock = BlockBase<'gallery'> & {
    heading?: string;
    caption?: string;
    images: Image[];
};

export type CtaBandBlock = BlockBase<'ctaBand'> & {
    heading: string;
    body?: string;
    cta?: Cta;
    tone: Tone;
};

export type Block =
    | HeroBlock
    | FactStripBlock
    | TapListBlock
    | EventListBlock
    | MenuBlock
    | FeatureSplitBlock
    | RichTextBlock
    | VisitInfoBlock
    | FaqBlock
    | GalleryBlock
    | CtaBandBlock;

export type BlockType = Block['type'];

export type Page = {
    id: string;
    slug: string;
    title: string;
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: Image;
    blocks: Block[];
};
