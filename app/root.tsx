import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration
} from 'react-router';

import type { Route } from './+types/root';
import { Announcement, SiteFooter, SiteHeader, Wordmark } from './components/site-chrome';
import { Container } from './components/primitives';
import { CenterLine } from './components/signage';
import { getSiteSettings } from './models/settings.server';

import 'lone-star-ui/styles';
import './app.css';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://images.ctfassets.net' },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700..900&family=Hanken+Grotesk:ital,wght@0,400..700;1,400&family=Instrument+Serif:ital@0;1&display=swap'
    },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
];

export async function loader() {
    return { settings: await getSiteSettings() };
}

// Runs before paint: the visitor's saved choice, else their system setting.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* A fictional brewery: keep it out of search results for real ones. */}
                <meta name="robots" content="noindex" />
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <Meta />
                <Links />
            </head>
            <body className="flex min-h-svh flex-col">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App({ loaderData }: Route.ComponentProps) {
    const { settings } = loaderData;
    return (
        <>
            <a href="#main" className="sr-only z-50 bg-longhorn px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
                Skip to content
            </a>
            <Announcement settings={settings} />
            <SiteHeader settings={settings} />
            <main id="main" className="flex-1">
                <Outlet />
            </main>
            <SiteFooter settings={settings} />
        </>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let heading = 'Road closed';
    let details = 'Something went wrong on our end. Give it a minute and try again.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error) && error.status === 404) {
        heading = 'Wrong turn';
        details = "There's no page at this mile marker. It may have moved, or it never existed.";
    } else if (import.meta.env.DEV && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <>
            <header>
                <Container className="py-4">
                    <Link to="/" className="hover:text-longhorn">
                        <Wordmark name="Ranch Road Brewing Co." />
                    </Link>
                </Container>
                <CenterLine />
            </header>
            <main className="flex-1">
                <Container className="py-24 sm:py-32">
                    <p className="font-serif text-2xl italic text-longhorn">
                        {isRouteErrorResponse(error) ? error.status : 'Error'}
                    </p>
                    <h1 className="mt-2 font-display text-poster font-black uppercase">{heading}</h1>
                    <p className="mt-6 max-w-lg text-lg text-pecan">{details}</p>
                    <Link to="/" className="mt-10 inline-flex min-h-12 items-center bg-longhorn px-6 font-display text-lg font-extrabold uppercase text-surface hover:bg-ink">
                        Back to the taproom →
                    </Link>
                    {stack && (
                        <pre className="mt-10 overflow-x-auto bg-mesa p-4 text-sm">
                            <code>{stack}</code>
                        </pre>
                    )}
                </Container>
            </main>
        </>
    );
}
