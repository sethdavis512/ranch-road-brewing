import * as contentful from 'contentful';
import { z } from 'zod';

const envSchema = z.object({
    CONTENTFUL_SPACE_ID: z.string().min(1),
    CONTENTFUL_DELIVERY_TOKEN: z.string().min(1),
    CONTENTFUL_ENVIRONMENT: z.string().default('master')
});

function createClient() {
    const env = envSchema.parse(process.env);
    return contentful.createClient({
        space: env.CONTENTFUL_SPACE_ID,
        accessToken: env.CONTENTFUL_DELIVERY_TOKEN,
        environment: env.CONTENTFUL_ENVIRONMENT
    }).withoutUnresolvableLinks;
}

let client: ReturnType<typeof createClient> | undefined;

/**
 * Delivery API client, created on first use so a missing env var fails the
 * request that needs it rather than every import. Links to unpublished or
 * deleted entries are dropped instead of arriving as bare `Link` objects, so a
 * half-finished edit in the CMS can never break a published page.
 */
export function getContentfulClient() {
    return (client ??= createClient());
}
