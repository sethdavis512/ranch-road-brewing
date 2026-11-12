import { data } from 'react-router';
import type { Route } from './+types/$';
import { BlockRenderer } from '~/blocks/BlockRenderer';
import { imageUrl } from '~/lib/image';
import { getPageBySlug } from '~/models/page.server';

export async function loader({ params }: Route.LoaderArgs) {
    // "/" arrives as an empty splat; it is the page with slug "home".
    const slug = params['*']?.replace(/\/+$/, '') || 'home';
    const page = await getPageBySlug(slug);

    if (!page) {
        throw data(null, { status: 404 });
    }

    return { page };
}

/** Short shared cache: edits in Contentful show up within a minute. */
export function headers() {
    return {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600'
    };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
    const siteName = matches[0]?.loaderData?.settings.name ?? 'Ranch Road Brewing Co.';
    const page = loaderData?.page;
    if (!page) return [{ title: siteName }];

    const title = page.slug === 'home' ? (page.seoTitle ?? siteName) : `${page.seoTitle ?? page.title} · ${siteName}`;
    const tags: Route.MetaDescriptors = [
        { title },
        { property: 'og:title', content: title },
        { property: 'og:site_name', content: siteName }
    ];
    if (page.seoDescription) {
        tags.push(
            { name: 'description', content: page.seoDescription },
            { property: 'og:description', content: page.seoDescription }
        );
    }
    if (page.ogImage) {
        tags.push({ property: 'og:image', content: imageUrl(page.ogImage, { width: 1200, height: 630, format: 'jpg' }) });
    }
    return tags;
}

export default function Page({ loaderData }: Route.ComponentProps) {
    return <BlockRenderer blocks={loaderData.page.blocks} />;
}
