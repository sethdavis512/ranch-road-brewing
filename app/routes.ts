import { type RouteConfig, index, route } from '@react-router/dev/routes';

// A CMS-driven catch-all drives every page: any path resolves to a Contentful
// `page` by slug; content is composed from CMS blocks. The splat ("*") does not
// match "/", so an index route re-exports the same module for the home page.
// See app/routes/$.tsx and app/blocks/registry.ts.
export default [
    index('routes/_index.tsx'),
    route('*', 'routes/$.tsx')
] satisfies RouteConfig;
