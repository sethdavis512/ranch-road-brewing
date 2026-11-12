import type { ComponentType } from 'react';
import { CtaBand } from './CtaBand';
import { EventList } from './EventList';
import { FactStrip } from './FactStrip';
import { Faq } from './Faq';
import { FeatureSplit } from './FeatureSplit';
import { Gallery } from './Gallery';
import { Hero } from './Hero';
import { Menu } from './Menu';
import { RichText } from './RichText';
import { TapList } from './TapList';
import type { Block, BlockType } from './types';
import { VisitInfo } from './VisitInfo';

/**
 * The client half of the block bank: one component per Contentful block
 * type. The mapped type makes TypeScript fail the build if a block type has
 * no component, or a component's props drift from its block's shape. The
 * server half (fields and data) is `app/models/blocks.server.ts`.
 */
export const blockRegistry: {
    [K in BlockType]: ComponentType<Extract<Block, { type: K }>>;
} = {
    hero: Hero,
    factStrip: FactStrip,
    tapList: TapList,
    eventList: EventList,
    menu: Menu,
    featureSplit: FeatureSplit,
    richText: RichText,
    visitInfo: VisitInfo,
    faq: Faq,
    gallery: Gallery,
    ctaBand: CtaBand
};
