import type { Image } from '~/blocks/types';

type Transform = {
    width: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg';
};

/** A Contentful Images API URL: resized, re-encoded, and cropped on the CDN. */
export function imageUrl(image: Image, { width, height, quality = 72, format = 'webp' }: Transform) {
    const params = new URLSearchParams({
        w: String(width),
        fm: format,
        q: String(quality)
    });
    if (height) {
        params.set('h', String(height));
        params.set('fit', 'fill');
    }
    return `${image.url}?${params}`;
}

const WIDTHS = [480, 800, 1200, 1600, 2000];

/**
 * `srcset` for an image. When `aspect` is set every candidate is cropped to
 * it, so art direction lives in code while the photo itself lives in the CMS.
 */
export function imageSrcSet(image: Image, aspect?: number) {
    return WIDTHS.filter((w) => w <= image.width)
        .map((w) => {
            const height = aspect ? Math.round(w / aspect) : undefined;
            return `${imageUrl(image, { width: w, height })} ${w}w`;
        })
        .join(', ');
}
