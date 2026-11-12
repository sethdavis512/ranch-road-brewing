/**
 * Builds the Ranch Road Brewing Co. space through the Contentful Management API:
 * content types (with editor help text), photos, and published seed content.
 *
 *   bun run cms:setup            # create everything in an empty space
 *   bun run cms:setup --reset    # delete ALL entries, assets, and content
 *                                # types in the environment first
 *
 * Needs CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN (Bun loads .env).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { assets, entries } from './contentful/content';
import { contentTypes, type Field } from './contentful/model';

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';
if (!SPACE || !TOKEN) {
    console.error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN');
    process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENVIRONMENT}`;
const LOCALE = 'en-US';
const RESET = process.argv.includes('--reset');
const IMAGES = fileURLToPath(new URL('./contentful/images', import.meta.url));

type Sys = { id: string; version: number; publishedVersion?: number; archivedVersion?: number };

async function cma(method: string, path: string, body?: unknown, headers: Record<string, string> = {}, attempt = 0): Promise<any> {
    const url = path.startsWith('http') ? path : `${BASE}${path}`;
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            ...headers
        },
        body: body === undefined ? undefined : body instanceof Blob ? body : JSON.stringify(body)
    });

    if (res.status === 429 && attempt < 6) {
        const wait = Number(res.headers.get('x-contentful-ratelimit-reset') ?? 1) * 1000 || 1000;
        await sleep(wait);
        return cma(method, path, body, headers, attempt + 1);
    }
    if (res.status === 204) return null;
    const json = await res.json();
    if (json?.sys?.id === 'OrganizationAccessGrantRequired') {
        throw new Error(
            'The management token is valid but not authorized for this organization. In Contentful, open Settings > CMA tokens and click Authorize next to the token.'
        );
    }
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json)}`);
    return json;
}

const version = (sys: Sys) => ({ 'X-Contentful-Version': String(sys.version) });

async function listAll(path: string) {
    const items: any[] = [];
    for (let skip = 0; ; skip += 100) {
        const page = await cma('GET', `${path}${path.includes('?') ? '&' : '?'}limit=100&skip=${skip}`);
        items.push(...page.items);
        if (skip + 100 >= page.total) return items;
    }
}

/* ---------------------------------------------------------------- reset */

async function reset() {
    console.log('Resetting: deleting every entry, asset, and content type…');
    for (const kind of ['entries', 'assets'] as const) {
        for (const item of await listAll(`/${kind}`)) {
            const sys: Sys = item.sys;
            if (sys.publishedVersion) {
                await cma('DELETE', `/${kind}/${sys.id}/published`, undefined, version(sys));
            }
            if (sys.archivedVersion) {
                await cma('DELETE', `/${kind}/${sys.id}/archived`, undefined, version(sys));
            }
            await cma('DELETE', `/${kind}/${sys.id}`);
        }
    }
    for (const type of await listAll('/content_types')) {
        if (type.sys.publishedVersion) await cma('DELETE', `/content_types/${type.sys.id}/published`);
        await cma('DELETE', `/content_types/${type.sys.id}`);
    }
}

/* -------------------------------------------------------- content types */

function toField({ help: _help, widget: _widget, ...field }: Field) {
    return { localized: false, required: false, validations: [], ...field };
}

async function createContentTypes() {
    for (const [id, def] of Object.entries(contentTypes)) {
        const created = await cma('PUT', `/content_types/${id}`, {
            name: def.name,
            description: def.description,
            displayField: def.displayField,
            fields: def.fields.map(toField)
        });
        await cma('PUT', `/content_types/${id}/published`, undefined, version(created.sys));

        // Help text and widgets live on the editor interface, not the type.
        const controls = def.fields
            .filter((f) => f.help || f.widget)
            .map((f) => ({
                fieldId: f.id,
                ...(f.widget && { widgetId: f.widget, widgetNamespace: 'builtin' }),
                settings: {
                    ...(f.help && { helpText: f.help }),
                    ...(f.widget === 'datePicker' && { format: 'timeZ', ampm: '12' }),
                    ...(f.widget === 'boolean' && { trueLabel: 'Yes', falseLabel: 'No' })
                }
            }));
        if (controls.length > 0) {
            const editor = await cma('GET', `/content_types/${id}/editor_interface`);
            await cma('PUT', `/content_types/${id}/editor_interface`, { controls }, version(editor.sys));
        }
        console.log(`content type ${id}`);
    }
}

/* --------------------------------------------------------------- assets */

async function uploadAssets() {
    await Promise.all(
        assets.map(async (asset) => {
            const bytes = new Blob([await readFile(join(IMAGES, asset.file))]);
            const upload = await cma('POST', `https://upload.contentful.com/spaces/${SPACE}/uploads`, bytes, {
                'Content-Type': 'application/octet-stream'
            });
            const created = await cma('PUT', `/assets/${asset.id}`, {
                fields: {
                    title: { [LOCALE]: asset.title },
                    description: { [LOCALE]: asset.alt },
                    file: {
                        [LOCALE]: {
                            contentType: 'image/jpeg',
                            fileName: asset.file,
                            uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } }
                        }
                    }
                }
            });
            await cma('PUT', `/assets/${asset.id}/files/${LOCALE}/process`, undefined, version(created.sys));

            for (let i = 0; i < 30; i++) {
                await sleep(1000);
                const current = await cma('GET', `/assets/${asset.id}`);
                if (current.fields.file?.[LOCALE]?.url) {
                    await cma('PUT', `/assets/${asset.id}/published`, undefined, version(current.sys));
                    console.log(`asset ${asset.id}`);
                    return;
                }
            }
            throw new Error(`asset ${asset.id} never finished processing`);
        })
    );
}

/* -------------------------------------------------------------- entries */

function localize(fields: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(fields)
            .filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0))
            .map(([key, value]) => [key, { [LOCALE]: value }])
    );
}

async function createEntries() {
    for (const entry of entries) {
        const created = await cma('PUT', `/entries/${entry.id}`, { fields: localize(entry.fields) }, {
            'X-Contentful-Content-Type': entry.type
        });
        await cma('PUT', `/entries/${entry.id}/published`, undefined, version(created.sys));
        console.log(`entry ${entry.type}:${entry.id}`);
    }
}

/* ------------------------------------------------------------------ run */

if (RESET) {
    await reset();
} else {
    const existing = await cma('GET', '/content_types?limit=1');
    if (existing.total > 0) {
        console.error('This environment already has content types. Run with --reset to replace everything in it.');
        process.exit(1);
    }
}

await createContentTypes();
await uploadAssets();
await createEntries();
console.log(`Done: ${Object.keys(contentTypes).length} content types, ${assets.length} assets, ${entries.length} entries.`);
