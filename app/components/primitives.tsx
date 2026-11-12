import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from 'lone-star-ui';
import type { Cta, Image, Tone } from '~/blocks/types';
import { imageSrcSet, imageUrl } from '~/lib/image';

export function Container({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
    return <div className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8', className)} {...props} />;
}

/** Background and text pairs for CMS-selectable section tones. */
export const toneClasses: Record<Tone, string> = {
    limestone: 'bg-mesa text-ink',
    highway: 'bg-bluebonnet text-surface',
    rust: 'bg-longhorn text-surface'
};

const ctaVariants = {
    primary:
        'bg-longhorn text-surface hover:bg-ink hover:text-surface dark:hover:bg-paper dark:hover:text-night',
    outline:
        'border-2 border-current text-ink hover:bg-ink hover:text-surface',
    photo: 'bg-paper text-night hover:bg-longhorn hover:text-paper',
    inverse: 'bg-surface text-ink hover:bg-ink hover:text-surface'
} as const;

type CtaLinkProps = {
    cta: Cta;
    variant?: keyof typeof ctaVariants;
    className?: string;
};

/** CMS hrefs can point inside the site or out; internal ones use client routing. */
export function CtaLink({ cta, variant = 'primary', className }: CtaLinkProps) {
    const classes = cn(
        'group inline-flex min-h-12 items-center gap-3 px-6 font-display text-lg font-extrabold tracking-wide uppercase transition-colors duration-200',
        ctaVariants[variant],
        className
    );
    const label = (
        <>
            {cta.label}
            <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-out-quint group-hover:translate-x-1"
            >
                →
            </span>
        </>
    );

    return isInternal(cta.href) ? (
        <Link to={cta.href} prefetch="intent" className={classes}>
            {label}
        </Link>
    ) : (
        <a href={cta.href} className={classes}>
            {label}
        </a>
    );
}

export function isInternal(href: string) {
    return href.startsWith('/') && !href.startsWith('//');
}

type SectionHeadingProps = {
    eyebrow?: string;
    heading: string;
    intro?: string;
    className?: string;
    children?: ReactNode;
};

export function SectionHeading({ eyebrow, heading, intro, className, children }: SectionHeadingProps) {
    return (
        <header className={cn('flex flex-wrap items-end justify-between gap-x-10 gap-y-6', className)}>
            <div className="max-w-2xl">
                {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                <h2 className="font-display text-display font-black uppercase">{heading}</h2>
                {intro && <p className="mt-5 max-w-xl text-lg text-pecan">{intro}</p>}
            </div>
            {children}
        </header>
    );
}

/** Small italic label with a short rule, the site's stand-in for a kicker. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn('mb-4 flex items-center gap-3 font-serif text-xl italic text-longhorn', className)}>
            <span aria-hidden="true" className="h-0.5 w-8 bg-current" />
            {children}
        </p>
    );
}

type ContentfulImageProps = {
    image: Image;
    sizes: string;
    /** Crop every candidate to this width / height ratio. */
    aspect?: number;
    priority?: boolean;
    className?: string;
};

export function ContentfulImage({ image, sizes, aspect, priority, className }: ContentfulImageProps) {
    const width = 1200;
    const height = Math.round(width / (aspect ?? image.width / image.height));

    return (
        <img
            src={imageUrl(image, { width, height: aspect ? height : undefined })}
            srcSet={imageSrcSet(image, aspect)}
            sizes={sizes}
            width={width}
            height={height}
            alt={image.alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className={cn('bg-mesa object-cover', className)}
        />
    );
}
