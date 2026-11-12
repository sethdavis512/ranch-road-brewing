import { TIME_ZONE, zoneOffsetMinutes } from '../../app/lib/events';

/**
 * Seed content for Ranch Road Brewing Co., a fictional Hill Country taproom.
 * Entry ids are fixed so links between entries are readable here.
 */

export type SeedAsset = { id: string; file: string; title: string; alt: string };
export type SeedEntry = { id: string; type: string; fields: Record<string, unknown> };

export const assets: SeedAsset[] = [
    { id: 'img-taproom', file: 'hero-taproom.jpg', title: 'Taproom at golden hour', alt: 'A limestone and rusted-metal taproom under live oaks, picnic tables and string lights at golden hour' },
    { id: 'img-crossing', file: 'crossing.jpg', title: 'The crossing', alt: 'Clear green creek water spilling over a concrete low-water crossing beside a striped depth post' },
    { id: 'img-flight', file: 'flight.jpg', title: 'Tasting flight', alt: 'Four tasting glasses from pale straw to near-black on a cedar picnic table' },
    { id: 'img-brewhouse', file: 'brewhouse.jpg', title: 'Brewhouse', alt: 'A brewer in a canvas apron checking a stainless tank in the limestone brewhouse' },
    { id: 'img-tacos', file: 'tacos.jpg', title: 'Brisket tacos', alt: 'Smoked brisket tacos with pickled red onion on a speckled enamel plate' },
    { id: 'img-music', file: 'music.jpg', title: 'Music under the oak', alt: 'An acoustic duo playing under a live oak at dusk, string lights overhead' },
    { id: 'img-dog', file: 'dog.jpg', title: 'Patio regular', alt: 'A brown and white dog resting in the gravel under a picnic table' },
    { id: 'img-night', file: 'night.jpg', title: 'After dark', alt: 'The taproom at blue hour, windows glowing and string lights across the yard' },
    { id: 'img-cans', file: 'cans.jpg', title: 'Crowlers', alt: 'Crowler cans and a growler lined up on the reclaimed-wood bar' },
    { id: 'img-patio', file: 'patio.jpg', title: 'Patio', alt: 'Friends raising pints at a long picnic table under the oaks' }
];

const link = (id: string) => ({ sys: { type: 'Link', linkType: 'Entry', id } });
const asset = (id: string) => ({ sys: { type: 'Link', linkType: 'Asset', id } });

/* ------------------------------------------------------------ rich text */

type Inline = string | { href: string; text: string };

function inline(part: Inline) {
    return typeof part === 'string'
        ? { nodeType: 'text', value: part, marks: [], data: {} }
        : {
              nodeType: 'hyperlink',
              data: { uri: part.href },
              content: [{ nodeType: 'text', value: part.text, marks: [], data: {} }]
          };
}

const p = (...parts: Inline[]) => ({ nodeType: 'paragraph', data: {}, content: parts.map(inline) });
const h2 = (value: string) => ({ nodeType: 'heading-2', data: {}, content: [inline(value)] });
const quote = (value: string) => ({ nodeType: 'blockquote', data: {}, content: [p(value)] });
const doc = (...content: unknown[]) => ({ nodeType: 'document', data: {}, content });

/* ---------------------------------------------------------------- dates */

/** An ISO timestamp `days` from today at a local taproom time. */
function local(days: number, hour: number, minute = 0) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
    const [y, m, d] = today.split('-').map(Number);
    const guess = new Date(Date.UTC(y, m - 1, d + days, hour, minute));
    const offset = zoneOffsetMinutes(guess);
    return new Date(guess.getTime() - offset * 60_000).toISOString();
}

/** Days from today until the next given weekday (0 = Sunday), at least `min` days out. */
function untilWeekday(weekday: number, min = 1) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: TIME_ZONE }));
    let days = (weekday - now.getDay() + 7) % 7;
    while (days < min) days += 7;
    return days;
}

/* ---------------------------------------------------------------- beers */

const beers: SeedEntry[] = [
    ['beer-two-lane', 'Two-Lane Lager', 'Helles lager', 4.8, 18, 'straw', 1, false, 'Our house beer. Soft, bready, and built for the second round.', ['Pint', 'Half pour', 'Crowler', '4-pack to go']],
    ['beer-limestone', 'Limestone Pale', 'American pale ale', 5.6, 38, 'gold', 2, false, 'Brewed with our own well water, which is hard as the bedrock. Bright citrus, dry finish.', ['Pint', 'Half pour', 'Crowler']],
    ['beer-cypress', 'Cypress Knees', 'West Coast IPA', 6.8, 62, 'gold', 3, false, 'Pine, grapefruit pith, and a bitterness that means it.', ['Pint', 'Half pour', 'Crowler']],
    ['beer-cattle-guard', 'Cattle Guard', 'Hazy IPA', 6.2, 30, 'straw', 4, false, 'Named for the rattle on the way in. Mango, peach, pillowy.', ['Pint', 'Half pour', 'Crowler', '4-pack to go']],
    ['beer-dry-spell', 'Dry Spell', 'Mexican-style lager', 4.5, 14, 'straw', 5, false, 'Crisp with a little lime zest, for when the creek is down to a trickle.', ['Pint', 'Crowler']],
    ['beer-agarita', 'Agarita Sour', 'Kettle sour with agarita berries', 4.2, 8, 'ruby', 6, true, 'Tart and jammy, made with berries picked off the fence line in May.', ['Half pour', 'Flight']],
    ['beer-pecan-bottom', 'Pecan Bottom', 'Brown ale with toasted pecans', 5.4, 22, 'brown', 7, false, 'Toffee, toasted nuts, and a little cocoa. Good by the fire pit.', ['Pint', 'Half pour', 'Crowler']],
    ['beer-night-swim', 'Night Swim', 'Oatmeal stout', 6.0, 34, 'black', 8, false, 'Roast coffee and dark chocolate, smooth as the deep hole below the crossing.', ['Pint', 'Half pour', 'Flight']],
    ['beer-flash-flood', 'Flash Flood', 'Double IPA', 8.4, 80, 'gold', undefined, false, 'Dry-hopping now. Big, resinous, and arriving all at once.', []],
    ['beer-first-freeze', 'First Freeze', 'Baltic porter', 7.8, 30, 'black', undefined, false, 'Lagering in the cold room for the first real norther.', []],
    ['beer-cedar-fever', 'Cedar Fever', 'Juniper gruit', 5.0, 12, 'amber', undefined, false, 'Retired for the season. It will be back in January, like the pollen.', []]
].map(([id, name, style, abv, ibu, color, tap, isNew, description, formats]) => ({
    id: id as string,
    type: 'beer',
    fields: {
        name,
        style,
        abv,
        ibu,
        color,
        tap,
        isNew,
        description,
        formats,
        status: id === 'beer-cedar-fever' ? 'Off' : tap === undefined ? 'Coming soon' : 'On tap'
    }
}));

/* --------------------------------------------------------------- events */

const sat = untilWeekday(6, 2);
const events: SeedEntry[] = [
    { id: 'event-trivia', type: 'event', fields: { title: 'Trivia on the Porch', kind: 'Trivia', startsAt: local(untilWeekday(3, 0) - 7, 19), endsAt: local(untilWeekday(3, 0) - 7, 21), repeatsWeekly: true, description: 'Six rounds, teams of up to five. Winners get a round of Two-Lane Lager.' } },
    { id: 'event-pickin', type: 'event', fields: { title: "Thursday Pickin' Circle", kind: 'Live music', startsAt: local(untilWeekday(4, 0) - 7, 18, 30), endsAt: local(untilWeekday(4, 0) - 7, 21), repeatsWeekly: true, description: 'Bring a fiddle, a guitar, or just your ears. Everyone plays, nobody is in charge.' } },
    { id: 'event-market', type: 'event', fields: { title: 'Sunday Creek Market', kind: 'Market', startsAt: local(untilWeekday(0, 0) - 7, 11), endsAt: local(untilWeekday(0, 0) - 7, 15), repeatsWeekly: true, description: 'Local honey, pecans, pottery, and whatever the neighbors grew this week.' } },
    { id: 'event-ramblers', type: 'event', fields: { title: 'The Gravel Bar Saints', kind: 'Live music', startsAt: local(sat, 19), endsAt: local(sat, 22), description: 'Country and western swing under the big oak. No cover.' } },
    { id: 'event-agarita', type: 'event', fields: { title: 'Agarita Sour release', kind: 'Release', startsAt: local(sat + 7, 14), endsAt: local(sat + 7, 18), description: 'First pours at two, crowlers while they last.' } },
    { id: 'event-leftovers', type: 'event', fields: { title: 'Leftovers Tacos', kind: 'Food', startsAt: local(sat + 13, 12), endsAt: local(sat + 13, 20), description: 'Smoked turkey tacos with cranberry salsa, the day after the big meal.' } },
    { id: 'event-lights', type: 'event', fields: { title: 'Lights on the Oaks', kind: 'Community', startsAt: local(sat + 21, 18), endsAt: local(sat + 21, 21), description: 'We string the big oak for the season. Cocoa for the kids, Night Swim for everyone else.' } },
    { id: 'event-flash-flood', type: 'event', fields: { title: 'Flash Flood release', kind: 'Release', startsAt: local(sat + 28, 14), endsAt: local(sat + 28, 18), description: 'The double IPA lands. Limit of two crowlers each.' } },
    { id: 'event-plunge', type: 'event', fields: { title: 'First Plunge', kind: 'Community', startsAt: local(sat + 49, 11), endsAt: local(sat + 49, 13), description: 'A cold dip in the creek, then warm chili by the fire. Towels are on you.' } }
];

/* ----------------------------------------------------------------- menu */

const menu: SeedEntry[] = [
    ['menu-pimento', 'Pimento cheese & saltines', 'Sharp cheddar, roasted peppers, a little heat.', 8, 'Snacks', ['Vegetarian'], false, 1],
    ['menu-pecans', 'Smoked pecans', 'Hickory, brown sugar, sea salt.', 6, 'Snacks', ['Vegan', 'Gluten-free'], false, 2],
    ['menu-queso', 'Queso & chips', 'With green chile and pico.', 10, 'Snacks', ['Vegetarian', 'Gluten-free', 'Spicy'], true, 3],
    ['menu-brisket-taco', 'Brisket taco', 'Twelve-hour brisket, pickled onion, salsa verde.', 6, 'Tacos', ['Gluten-free'], true, 1],
    ['menu-mushroom-taco', 'Smoked mushroom taco', 'Oyster mushrooms, charred corn, chipotle crema.', 5, 'Tacos', ['Vegan', 'Gluten-free'], true, 2],
    ['menu-tinga-taco', 'Chicken tinga taco', 'Tomato, chipotle, crema, cotija.', 5, 'Tacos', ['Spicy'], false, 3],
    ['menu-brisket-plate', 'Brisket plate', 'Half pound, pickles, white bread, and two sides.', 18, 'Plates', [], true, 1],
    ['menu-chicken', 'Smoked half chicken', 'Lemon-pepper rub, with slaw.', 16, 'Plates', ['Gluten-free'], false, 2],
    ['menu-salad', 'Peach & arugula salad', 'Goat cheese, candied pecans, honey vinaigrette.', 12, 'Plates', ['Vegetarian', 'Gluten-free'], false, 3],
    ['menu-banana', 'Banana pudding', 'Vanilla wafers, made every morning.', 7, 'Sweets', ['Vegetarian'], false, 1],
    ['menu-pie-bar', 'Pecan pie bar', 'With a stout caramel drizzle.', 6, 'Sweets', ['Vegetarian'], false, 2],
    ['menu-grilled-cheese', 'Grilled cheese & apples', 'For anyone under twelve.', 7, 'Kids', ['Vegetarian'], false, 1]
].map(([id, name, description, price, category, tags, featured, sortOrder]) => ({
    id: id as string,
    type: 'menuItem',
    fields: { name, description, price, category, tags, featured, sortOrder }
}));

/* ------------------------------------------------------------------ faq */

const faqs: SeedEntry[] = [
    ['faq-dogs', 'Can I bring my dog?', 'Yes, on a leash, anywhere outside. Water bowls are by the north gate. Inside the taproom is people only.'],
    ['faq-kids', 'Are kids welcome?', 'Until 8 pm, with a grown-up. There is a kids menu, a sandbox under the oaks, and plenty of room to run.'],
    ['faq-flood', 'What happens when the creek is up?', 'If water is over the crossing, we post it in the banner at the top of this site. Use the north gate off the county road; it stays dry. Never drive through moving water.'],
    ['faq-reservations', 'Do you take reservations?', 'Not for tables. For groups of 15 or more, or to book the porch for a party, call us and we will sort it out.'],
    ['faq-togo', 'Can I take beer home?', 'Most of the board is available in crowlers filled to order, and the core beers come in four-packs to go.'],
    ['faq-access', 'Is the taproom accessible?', 'The taproom, restrooms, and the porch are step-free from the north lot. The yard is packed gravel.']
].map(([id, question, answer]) => ({ id, type: 'faqItem', fields: { question, answer } }));

/* --------------------------------------------------------------- blocks */

const blocks: SeedEntry[] = [
    // Home
    { id: 'home-hero', type: 'hero', fields: { eyebrow: 'Mile 8 · Hill Country, Texas', heading: 'Cold beer, mile eight.', subheading: 'A small taproom under the live oaks, out where the ranch road dips through the creek. Eight beers on, brisket off the smoker, and nowhere you need to be.', image: asset('img-taproom'), primaryCtaLabel: "See what's pouring", primaryCtaHref: '/beer', secondaryCtaLabel: 'Plan a visit', secondaryCtaHref: '/visit', layout: 'Full bleed' } },
    { id: 'home-facts', type: 'factStrip', fields: { facts: ['8 | taps pouring', 'Two acres | of oak shade', 'Dogs | always welcome', 'Mile 8 | on the ranch road'] } },
    { id: 'home-taps', type: 'tapList', fields: { heading: 'The board', intro: 'Brewed here, poured here, usually within a few weeks of the grain going in.', limit: 4, ctaLabel: 'The whole board', ctaHref: '/beer' } },
    { id: 'home-story', type: 'featureSplit', fields: { eyebrow: 'Why here', heading: 'We built it where the pavement gets wet.', body: doc(p('Right past mile 8, the ranch road dips through the creek on a concrete slab. It floods a few times a year. Most people would call that a reason to build somewhere else. We called it the best swimming hole in the county and put a brewery next to it.'), p('The water we brew with comes from the same limestone the creek runs over, which is why our lagers taste the way they do.')), image: asset('img-crossing'), imagePosition: 'Left', ctaLabel: 'Our story', ctaHref: '/story', tone: 'Limestone' } },
    { id: 'home-events', type: 'eventList', fields: { heading: 'This week and next', limit: 3, ctaLabel: 'All events', ctaHref: '/events' } },
    { id: 'home-menu', type: 'menu', fields: { heading: 'Off the smoker', intro: 'The kitchen window opens an hour after we do.', featuredOnly: true, ctaLabel: 'Full menu', ctaHref: '/food' } },
    { id: 'home-cta', type: 'ctaBand', fields: { heading: 'Bring the dog. Stay till the lights come on.', body: 'Open Wednesday through Sunday. The crossing is usually dry; the banner up top will tell you if it isn’t.', ctaLabel: 'Hours and directions', ctaHref: '/visit', tone: 'Rust' } },

    // Beer
    { id: 'beer-hero', type: 'hero', fields: { eyebrow: 'On tap', heading: 'Eight lines, all ours.', subheading: 'Lagers we are proud of, hoppy beers we are honest about, and a stout for the cold nights.', image: asset('img-flight'), layout: 'Split' } },
    { id: 'beer-taps', type: 'tapList', fields: { heading: 'The whole board', intro: 'Pints, half pours, and flights of four at the bar. Crowlers are filled to order.', showComingSoon: true } },
    { id: 'beer-brewhouse', type: 'featureSplit', fields: { eyebrow: 'The brewhouse', heading: 'Seven barrels and a lot of patience.', body: doc(p('Our lagers sit cold for six weeks before they get near a tap. It is the slowest thing we do and the thing we would never cut.'), p('Tours run Saturday at 1 pm. Ask at the bar.')), image: asset('img-brewhouse'), imagePosition: 'Right', tone: 'Highway' } },
    { id: 'beer-faq', type: 'faq', fields: { heading: 'Taking it home', items: [link('faq-togo'), link('faq-reservations')] } },

    // Events
    { id: 'events-hero', type: 'hero', fields: { eyebrow: 'Events', heading: 'Something on most nights.', subheading: 'Trivia, music under the big oak, and a market on Sundays. Everything is free unless we say otherwise.', image: asset('img-music'), layout: 'Full bleed' } },
    { id: 'events-list', type: 'eventList', fields: { heading: 'Coming up', limit: 12, emptyMessage: 'The calendar is quiet right now. The porch is still open.' } },
    { id: 'events-private', type: 'featureSplit', fields: { eyebrow: 'Private events', heading: 'Book the porch.', body: doc(p('Birthdays, rehearsal dinners, the office party that finally leaves the office. The covered porch seats sixty, and we will run a tab or pour from a keg.'), p('Call us and we will work it out.')), image: asset('img-patio'), imagePosition: 'Left', tone: 'Limestone' } },
    { id: 'events-cta', type: 'ctaBand', fields: { heading: 'Playing in a band?', body: 'We book local acts for Saturday nights. Send us a link and a weekend you want.', ctaLabel: 'How to reach us', ctaHref: '/visit', tone: 'Highway' } },

    // Food
    { id: 'food-hero', type: 'hero', fields: { eyebrow: 'The kitchen window', heading: 'Brisket at noon, tacos till close.', subheading: 'Everything is smoked out back over post oak. When the brisket is gone, it is gone.', image: asset('img-tacos'), layout: 'Split' } },
    { id: 'food-menu', type: 'menu', fields: { heading: 'The menu', intro: 'Order at the window and we will bring it out to your table.' } },
    { id: 'food-note', type: 'richText', fields: { heading: 'Allergies', body: doc(p('Our kitchen handles nuts, dairy, wheat, and eggs. Tell the window about any allergy and we will walk you through what is safe.')) } },

    // Visit
    { id: 'visit-hero', type: 'hero', fields: { eyebrow: 'Visit', heading: 'Mile eight. Look for the oaks.', subheading: 'We are just past the mile 8 marker, before the road dips through the creek. When the creek is up, the north gate keeps you dry.', image: asset('img-night'), layout: 'Full bleed' } },
    { id: 'visit-info', type: 'visitInfo', fields: { heading: 'Hours & directions', body: 'Parking is in the north lot and along the fence. Rideshare drop-off is at the north gate.\n\nLast call is thirty minutes before close.', image: asset('img-dog') } },
    { id: 'visit-faq', type: 'faq', fields: { heading: 'Good to know', items: [link('faq-flood'), link('faq-dogs'), link('faq-kids'), link('faq-access'), link('faq-reservations')] } },

    // Story
    { id: 'story-hero', type: 'hero', fields: { eyebrow: 'Our story', heading: 'Two brewers, one ranch road, and a lot of gravel.', image: asset('img-patio'), layout: 'Split' } },
    { id: 'story-body', type: 'richText', fields: { heading: 'How it started', body: doc(p('Ranch Road Brewing started as a homebrew club that met on a gravel bar by the crossing at mile 8. By the third summer there were more people than beer, so we leased the old limestone feed store up the hill and fixed the roof.'), quote('Out here, directions are a road number and a mile marker. Ours is the one with the cold beer.'), h2('What we care about'), p('Lagers that take their time. Food that comes off a real fire. A place where you can bring the kids, the dog, and your aunt from out of town, and everybody finds a spot in the shade.'), p('Come see for yourself. ', { href: '/visit', text: 'Here is how to find us' }, '.')) } },
    { id: 'story-gallery', type: 'gallery', fields: { heading: 'Around the yard', caption: 'Most evenings look like this from about six.', images: [asset('img-taproom'), asset('img-cans'), asset('img-dog'), asset('img-flight'), asset('img-night')] } },
    { id: 'story-cta', type: 'ctaBand', fields: { heading: 'The porch is open.', ctaLabel: "See what's pouring", ctaHref: '/beer', tone: 'Rust' } }
];

/* ---------------------------------------------------------------- pages */

const page = (slug: string, title: string, sections: string[], extra: Record<string, unknown> = {}): SeedEntry => ({
    id: `page-${slug}`,
    type: 'page',
    fields: { slug, title, sections: sections.map(link), ...extra }
});

const pages: SeedEntry[] = [
    page('home', 'Home', ['home-hero', 'home-facts', 'home-taps', 'home-story', 'home-events', 'home-menu', 'home-cta'], {
        seoTitle: 'Ranch Road Brewing Co. · Cold beer, mile eight',
        seoDescription: 'A Hill Country taproom under the live oaks at mile 8 on the ranch road. Eight beers on tap, brisket off the smoker.',
        ogImage: asset('img-taproom')
    }),
    page('beer', 'Beer', ['beer-hero', 'beer-taps', 'beer-brewhouse', 'beer-faq'], { seoDescription: 'Everything on tap right now, plus what is in the tanks.', ogImage: asset('img-flight') }),
    page('events', 'Events', ['events-hero', 'events-list', 'events-private', 'events-cta'], { seoDescription: 'Trivia, live music, releases, and the Sunday market.', ogImage: asset('img-music') }),
    page('food', 'Food', ['food-hero', 'food-menu', 'food-note'], { seoDescription: 'Brisket, tacos, and snacks from the smoker out back.', ogImage: asset('img-tacos') }),
    page('visit', 'Visit', ['visit-hero', 'visit-info', 'visit-faq'], { seoDescription: 'Hours, directions, and what to do when the creek is up.', ogImage: asset('img-night') }),
    page('story', 'Our story', ['story-hero', 'story-body', 'story-gallery', 'story-cta'], { navLabel: 'Story', seoDescription: 'How a homebrew club on a gravel bar became a taproom.', ogImage: asset('img-patio') })
];

const settings: SeedEntry = {
    id: 'site-settings',
    type: 'siteSettings',
    fields: {
        name: 'Ranch Road Brewing Co.',
        tagline: 'Cold beer, mile eight.',
        announcement: "Creek's down and the crossing is open. Agarita Sour is back on tap.",
        announcementTone: 'Highway',
        address: 'Mile 8, Ranch Road\nBlanco County, Texas',
        phone: '(512) 555-0142',
        hours: ['Mon – Tue | Closed', 'Wed – Thu | 3 pm – 10 pm', 'Fri | 3 pm – midnight', 'Sat | Noon – midnight', 'Sun | Noon – 8 pm'],
        navigation: ['beer', 'events', 'food', 'visit', 'story'].map((slug) => link(`page-${slug}`))
    }
};

/** In dependency order: everything an entry links to is created before it. */
export const entries: SeedEntry[] = [...beers, ...events, ...menu, ...faqs, ...blocks, ...pages, settings];
