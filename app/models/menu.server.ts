import { z } from 'zod';
import {
    MENU_CATEGORIES,
    MENU_TAGS,
    type MenuGroup,
    type MenuItem
} from '~/blocks/types';
import { getContentfulClient } from '~/lib/contentful.server';
import { entry, warnSkipped } from './parse.server';

const menuEntry = entry({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    category: z.enum(MENU_CATEGORIES),
    tags: z.array(z.enum(MENU_TAGS)).optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().optional()
});

type KitchenItem = MenuItem & { featured: boolean; sortOrder: number };

export async function getMenuItems(): Promise<KitchenItem[]> {
    const response = await getContentfulClient().getEntries({
        content_type: 'menuItem',
        limit: 200
    });

    return response.items.flatMap((item) => {
        const parsed = menuEntry.safeParse(item);
        if (!parsed.success) {
            warnSkipped('menu item', item.sys.id, parsed.error);
            return [];
        }
        const { sys, fields } = parsed.data;
        return [
            {
                id: sys.id,
                name: fields.name,
                description: fields.description,
                price: fields.price,
                category: fields.category,
                tags: fields.tags ?? [],
                featured: fields.featured ?? false,
                sortOrder: fields.sortOrder ?? 99
            }
        ];
    });
}

/** Groups items in menu order, keeping only the categories that have items. */
export function groupMenu(
    items: KitchenItem[],
    { featuredOnly = false } = {}
): MenuGroup[] {
    const visible = featuredOnly ? items.filter((i) => i.featured) : items;
    return MENU_CATEGORIES.map((category) => ({
        category,
        items: visible
            .filter((i) => i.category === category)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(({ featured: _f, sortOrder: _s, ...item }) => item)
    })).filter((group) => group.items.length > 0);
}
