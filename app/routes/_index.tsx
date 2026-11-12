// The splat route ("*") does not match the root URL "/", so this index route
// reuses its loader/headers/meta/component to serve the Contentful "home" page there.
export { loader, headers, meta, default } from './$';
