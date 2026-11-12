import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { cn } from 'lone-star-ui';
import type { SiteSettings } from '~/blocks/types';
import { Container, toneClasses } from './primitives';
import { Asphalt, CenterLine, RouteMarker } from './signage';

export function Wordmark({ name, large, className }: { name: string; large?: boolean; className?: string }) {
    // "Ranch Road Brewing Co." sets as RANCH ROAD over an italic "Brewing Co.",
    // beside the route marker for mile 8.
    const [lead, ...rest] = name.split(/\s+(?=Brewing)/);
    return (
        <span className={cn('inline-flex items-center', large ? 'gap-4' : 'gap-2.5', className)}>
            <RouteMarker number="8" className={large ? 'text-8xl' : 'text-[3.25rem]'} />
            <span className="flex flex-col leading-none">
                <span className={cn('font-display font-black tracking-tight uppercase', large ? 'text-6xl' : 'text-3xl')}>{lead}</span>
                {rest.length > 0 && (
                    <span className={cn('font-serif italic text-longhorn', large ? 'text-2xl' : 'text-base')}>{rest.join(' ')}</span>
                )}
            </span>
        </span>
    );
}

export function Announcement({ settings }: { settings: SiteSettings }) {
    if (!settings.announcement) return null;
    return (
        <div className={cn('text-sm font-semibold', toneClasses[settings.announcementTone])}>
            <Container className="flex items-center gap-3 py-2">
                <span aria-hidden="true" className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />
                    <span className="relative inline-flex size-2 rounded-full bg-current" />
                </span>
                <p>{settings.announcement}</p>
            </Container>
        </div>
    );
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    useEffect(() => setOpen(false), [location.pathname]);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            'relative font-display text-xl font-extrabold tracking-wide uppercase transition-colors hover:text-longhorn',
            isActive && 'text-longhorn after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:bg-current'
        );

    return (
        <header className="relative z-40 bg-surface">
            <Container className="flex items-center justify-between gap-6 py-4">
                <Link to="/" aria-label={`${settings.name}, home`} className="hover:text-longhorn">
                    <Wordmark name={settings.name} />
                </Link>

                <nav aria-label="Main" className="hidden md:block">
                    <ul className="flex items-center gap-8">
                        {settings.navigation.map((item) => (
                            <li key={item.href}>
                                <NavLink to={item.href} prefetch="intent" className={navLinkClass}>
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    type="button"
                    className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold uppercase md:hidden"
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    onClick={() => setOpen((value) => !value)}
                >
                    {open ? 'Close' : 'Menu'}
                    <span aria-hidden="true" className="flex w-5 flex-col gap-1">
                        <span className={cn('h-0.5 bg-current transition-transform', open && 'translate-y-1.5 rotate-45')} />
                        <span className={cn('h-0.5 bg-current transition-opacity', open && 'opacity-0')} />
                        <span className={cn('h-0.5 bg-current transition-transform', open && '-translate-y-1.5 -rotate-45')} />
                    </span>
                </button>
            </Container>
            <CenterLine />

            <nav
                id="mobile-nav"
                aria-label="Main"
                hidden={!open}
                className="absolute inset-x-0 top-full border-b-2 border-ink bg-surface md:hidden"
            >
                <Container>
                    <ul className="divide-y divide-ink/15 py-2">
                        {settings.navigation.map((item) => (
                            <li key={item.href}>
                                <NavLink to={item.href} className={({ isActive }) => cn('block py-3 font-display text-4xl font-black uppercase', isActive && 'text-longhorn')}>
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </Container>
            </nav>
        </header>
    );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
    return (
        <footer className="bg-night text-paper">
            <Asphalt />
            <Container className="grid gap-12 py-16 md:grid-cols-12">
                <div className="md:col-span-5">
                    <Wordmark name={settings.name} large />
                    <p className="mt-5 max-w-sm font-serif text-2xl italic">{settings.tagline}</p>
                </div>

                <div className="md:col-span-4">
                    <h2 className="font-display text-lg font-extrabold tracking-widest uppercase opacity-70">Hours</h2>
                    <dl className="mt-3 space-y-1.5">
                        {settings.hours.map((row) => (
                            <div key={row.days} className="flex justify-between gap-4 border-b border-paper/15 pb-1.5">
                                <dt>{row.days}</dt>
                                <dd className="tabular-nums">{row.hours}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="md:col-span-3">
                    <h2 className="font-display text-lg font-extrabold tracking-widest uppercase opacity-70">Find us</h2>
                    <address className="mt-3 not-italic whitespace-pre-line">{settings.address}</address>
                    {settings.phone && (
                        <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="mt-2 inline-block underline underline-offset-4 hover:text-longhorn">
                            {settings.phone}
                        </a>
                    )}
                    <ThemeToggle className="mt-8" />
                </div>
            </Container>

            <Container className="flex flex-col gap-2 border-t border-paper/15 py-6 text-sm opacity-80 sm:flex-row sm:justify-between">
                <p>
                    {settings.name} is a fictional brewery. This site is a concept by{' '}
                    <a href="https://techwithseth.com/work/ranch-road-brewing" className="underline underline-offset-4 hover:text-longhorn">
                        Tech with Seth
                    </a>
                    .
                </p>
                <p>Pages composed in Contentful, rendered with React Router.</p>
            </Container>
        </footer>
    );
}

/** "Daylight" or "After dark". The inline script in root.tsx applies it before paint. */
export function ThemeToggle({ className }: { className?: string }) {
    const [dark, setDark] = useState<boolean | null>(null);
    useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);

    function choose(next: boolean) {
        document.documentElement.classList.toggle('dark', next);
        try {
            localStorage.setItem('theme', next ? 'dark' : 'light');
        } catch {
            // Storage can be blocked; the choice still applies for this visit.
        }
        setDark(next);
    }

    const option = (label: string, value: boolean) => (
        <button
            type="button"
            aria-pressed={dark === value}
            onClick={() => choose(value)}
            className={cn(
                'min-h-10 px-4 font-display text-base font-extrabold tracking-wide uppercase transition-colors',
                dark === value ? 'bg-paper text-night' : 'hover:text-longhorn'
            )}
        >
            {label}
        </button>
    );

    return (
        <div role="group" aria-label="Color theme" className={cn('inline-flex border-2 border-paper/70', className)}>
            {option('Daylight', false)}
            {option('After dark', true)}
        </div>
    );
}
