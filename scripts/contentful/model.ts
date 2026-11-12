import {
    BEER_COLORS,
    BEER_STATUSES,
    EVENT_KINDS,
    MENU_CATEGORIES,
    MENU_TAGS,
    type BlockType
} from '../../app/blocks/types';

/**
 * The Contentful content model, as code. `bun run cms:setup` creates it.
 * Field ids must match the Zod schemas in app/models/*.server.ts.
 */

export type Field = {
    id: string;
    name: string;
    type: string;
    required?: boolean;
    localized?: boolean;
    validations?: unknown[];
    items?: { type: string; linkType?: string; validations?: unknown[] };
    linkType?: string;
    /** Shown under the field in the editor. Not part of the content type. */
    help?: string;
    /** Editor widget id, e.g. "radio", "boolean", "datePicker". */
    widget?: string;
};

export type ContentTypeDef = {
    name: string;
    description: string;
    displayField: string;
    fields: Field[];
};

const symbol = (id: string, name: string, extra: Partial<Field> = {}): Field => ({ id, name, type: 'Symbol', ...extra });
const text = (id: string, name: string, extra: Partial<Field> = {}): Field => ({ id, name, type: 'Text', ...extra });
const oneOf = (values: readonly string[]) => [{ in: [...values] }];
const image = (id: string, name: string, help?: string): Field => ({ id, name, type: 'Link', linkType: 'Asset', help, validations: [{ linkMimetypeGroup: ['image'] }] });
const cta = (prefix: string, label: string): Field[] => [
    symbol(`${prefix}Label`, `${label} label`),
    symbol(`${prefix}Href`, `${label} link`, { help: 'A page path like /events, or a full URL.' })
];
const tone = (): Field => symbol('tone', 'Tone', { validations: oneOf(['Limestone', 'Highway', 'Rust']), widget: 'radio', help: 'Background color for the section.' });

const blocks: Record<BlockType, ContentTypeDef> = {
    hero: {
        name: 'Block: Hero',
        description: 'The big opening section of a page.',
        displayField: 'heading',
        fields: [
            symbol('eyebrow', 'Eyebrow', { help: 'Short line above the heading.' }),
            symbol('heading', 'Heading', { required: true, help: 'Sentences on a full-bleed hero break onto their own lines.' }),
            text('subheading', 'Subheading'),
            image('image', 'Image', 'Landscape photo, at least 2000px wide.'),
            ...cta('primaryCta', 'Primary button'),
            ...cta('secondaryCta', 'Secondary button'),
            symbol('layout', 'Layout', { validations: oneOf(['Full bleed', 'Split']), widget: 'radio' })
        ]
    },
    factStrip: {
        name: 'Block: Fact strip',
        description: 'A row of quick facts.',
        displayField: 'facts',
        fields: [
            {
                id: 'facts',
                name: 'Facts',
                type: 'Array',
                required: true,
                items: { type: 'Symbol' },
                validations: [{ size: { min: 2, max: 4 } }],
                help: 'Two to four, each written "Value | label", e.g. "14 | taps pouring".'
            }
        ]
    },
    tapList: {
        name: 'Block: Tap list',
        description: 'Every beer marked "On tap", in tap order. Updates itself when a beer changes.',
        displayField: 'heading',
        fields: [
            symbol('heading', 'Heading', { required: true }),
            text('intro', 'Intro'),
            { id: 'limit', name: 'Show at most', type: 'Integer', help: 'Leave empty to show every beer on tap.' },
            { id: 'showComingSoon', name: 'Show "coming soon" beers', type: 'Boolean', widget: 'boolean' },
            ...cta('cta', 'Button')
        ]
    },
    eventList: {
        name: 'Block: Event list',
        description: 'Upcoming events, soonest first. Past events drop off on their own.',
        displayField: 'heading',
        fields: [
            symbol('heading', 'Heading', { required: true }),
            text('intro', 'Intro'),
            { id: 'limit', name: 'Show at most', type: 'Integer' },
            symbol('emptyMessage', 'When nothing is scheduled'),
            ...cta('cta', 'Button')
        ]
    },
    menu: {
        name: 'Block: Food menu',
        description: 'Menu items grouped by category.',
        displayField: 'heading',
        fields: [
            symbol('heading', 'Heading', { required: true }),
            text('intro', 'Intro'),
            { id: 'featuredOnly', name: 'Featured items only', type: 'Boolean', widget: 'boolean' },
            ...cta('cta', 'Button')
        ]
    },
    featureSplit: {
        name: 'Block: Feature (image + text)',
        description: 'A photo beside a heading and a few paragraphs.',
        displayField: 'heading',
        fields: [
            symbol('eyebrow', 'Eyebrow'),
            symbol('heading', 'Heading', { required: true }),
            { id: 'body', name: 'Body', type: 'RichText' },
            image('image', 'Image'),
            symbol('imagePosition', 'Image side', { validations: oneOf(['Left', 'Right']), widget: 'radio' }),
            ...cta('cta', 'Button'),
            tone()
        ]
    },
    richText: {
        name: 'Block: Rich text',
        description: 'Long-form writing.',
        displayField: 'heading',
        fields: [symbol('heading', 'Heading'), { id: 'body', name: 'Body', type: 'RichText', required: true }]
    },
    visitInfo: {
        name: 'Block: Visit info',
        description: 'Hours and address (from Site settings) with a map.',
        displayField: 'heading',
        fields: [symbol('heading', 'Heading', { required: true }), text('body', 'Body'), image('image', 'Image')]
    },
    faq: {
        name: 'Block: FAQ',
        description: 'Questions that open to their answers.',
        displayField: 'heading',
        fields: [
            symbol('heading', 'Heading', { required: true }),
            {
                id: 'items',
                name: 'Questions',
                type: 'Array',
                required: true,
                items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['faqItem'] }] }
            }
        ]
    },
    gallery: {
        name: 'Block: Gallery',
        description: 'A grid of photos, the first one large.',
        displayField: 'heading',
        fields: [
            symbol('heading', 'Heading'),
            symbol('caption', 'Caption'),
            {
                id: 'images',
                name: 'Images',
                type: 'Array',
                required: true,
                items: { type: 'Link', linkType: 'Asset', validations: [{ linkMimetypeGroup: ['image'] }] },
                validations: [{ size: { min: 2, max: 10 } }]
            }
        ]
    },
    ctaBand: {
        name: 'Block: Call to action',
        description: 'A colored band with one button.',
        displayField: 'heading',
        fields: [symbol('heading', 'Heading', { required: true }), text('body', 'Body'), ...cta('cta', 'Button'), tone()]
    }
};

export const BLOCK_TYPES = Object.keys(blocks) as BlockType[];

export const contentTypes: Record<string, ContentTypeDef> = {
    siteSettings: {
        name: 'Site settings',
        description: 'Name, hours, banner, and navigation. Keep exactly one.',
        displayField: 'name',
        fields: [
            symbol('name', 'Brewery name', { required: true }),
            symbol('tagline', 'Tagline', { required: true }),
            symbol('announcement', 'Banner', { help: 'Shown across the top of every page. Leave empty to hide it.' }),
            symbol('announcementTone', 'Banner tone', { validations: oneOf(['Limestone', 'Highway', 'Rust']), widget: 'radio' }),
            text('address', 'Address', { required: true }),
            symbol('phone', 'Phone'),
            {
                id: 'hours',
                name: 'Hours',
                type: 'Array',
                items: { type: 'Symbol' },
                help: 'One line per row, written "Days | Hours", e.g. "Wed – Thu | 3 pm – 10 pm".'
            },
            {
                id: 'navigation',
                name: 'Navigation',
                type: 'Array',
                items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['page'] }] },
                help: 'Pages in the main menu, in order.'
            }
        ]
    },
    page: {
        name: 'Page',
        description: 'A page on the site, built from blocks.',
        displayField: 'title',
        fields: [
            symbol('title', 'Title', { required: true }),
            symbol('slug', 'Slug', {
                required: true,
                validations: [{ unique: true }, { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$' } }],
                help: 'The page address without a leading slash. Use "home" for the front page.',
                widget: 'slugEditor'
            }),
            symbol('navLabel', 'Menu label', { help: 'Shorter name for the main menu. Defaults to the title.' }),
            symbol('seoTitle', 'SEO title'),
            text('seoDescription', 'SEO description', { validations: [{ size: { max: 160 } }] }),
            image('ogImage', 'Social share image'),
            {
                id: 'sections',
                name: 'Sections',
                type: 'Array',
                items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: BLOCK_TYPES }] },
                help: 'Drag to reorder. Each section is a block.'
            }
        ]
    },
    beer: {
        name: 'Beer',
        description: 'A beer on the board. Change its status and every tap list updates.',
        displayField: 'name',
        fields: [
            symbol('name', 'Name', { required: true }),
            symbol('style', 'Style', { required: true }),
            { id: 'abv', name: 'ABV (%)', type: 'Number', required: true, validations: [{ range: { min: 0, max: 20 } }] },
            { id: 'ibu', name: 'IBU', type: 'Integer' },
            text('description', 'Tasting note', { validations: [{ size: { max: 220 } }] }),
            symbol('color', 'Color', { required: true, validations: oneOf(BEER_COLORS), widget: 'dropdown' }),
            symbol('status', 'Status', { required: true, validations: oneOf(BEER_STATUSES), widget: 'radio' }),
            { id: 'tap', name: 'Tap number', type: 'Integer', help: 'Orders the board.' },
            { id: 'isNew', name: 'Mark as new', type: 'Boolean', widget: 'boolean' },
            {
                id: 'formats',
                name: 'Pours and to-go',
                type: 'Array',
                items: { type: 'Symbol', validations: oneOf(['Pint', 'Half pour', 'Flight', 'Crowler', '4-pack to go']) },
                widget: 'checkbox'
            }
        ]
    },
    event: {
        name: 'Event',
        description: 'Shows up in every event list until it ends.',
        displayField: 'title',
        fields: [
            symbol('title', 'Title', { required: true }),
            symbol('kind', 'Kind', { required: true, validations: oneOf(EVENT_KINDS), widget: 'dropdown' }),
            { id: 'startsAt', name: 'Starts', type: 'Date', required: true, widget: 'datePicker' },
            { id: 'endsAt', name: 'Ends', type: 'Date', widget: 'datePicker' },
            text('description', 'Description'),
            { id: 'repeatsWeekly', name: 'Repeats every week', type: 'Boolean', widget: 'boolean' }
        ]
    },
    menuItem: {
        name: 'Menu item',
        description: 'A dish from the kitchen window.',
        displayField: 'name',
        fields: [
            symbol('name', 'Name', { required: true }),
            text('description', 'Description'),
            { id: 'price', name: 'Price ($)', type: 'Number', required: true },
            symbol('category', 'Category', { required: true, validations: oneOf(MENU_CATEGORIES), widget: 'dropdown' }),
            { id: 'tags', name: 'Tags', type: 'Array', items: { type: 'Symbol', validations: oneOf(MENU_TAGS) }, widget: 'checkbox' },
            { id: 'featured', name: 'Featured on the home page', type: 'Boolean', widget: 'boolean' },
            { id: 'sortOrder', name: 'Sort order', type: 'Integer' }
        ]
    },
    faqItem: {
        name: 'FAQ question',
        description: 'One question and answer.',
        displayField: 'question',
        fields: [symbol('question', 'Question', { required: true }), text('answer', 'Answer', { required: true })]
    },
    ...blocks
};
