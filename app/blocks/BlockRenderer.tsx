import type { ComponentType } from 'react';
import { blockRegistry } from './registry';
import type { Block } from './types';

/** Renders a page's blocks in the order editors arranged them in Contentful. */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    return blocks.map((block) => {
        const Component = blockRegistry[block.type] as ComponentType<Block>;
        return <Component key={block.id} {...block} />;
    });
}
