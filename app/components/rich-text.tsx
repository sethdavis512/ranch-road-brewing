import {
    documentToReactComponents,
    type Options
} from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, type Document } from '@contentful/rich-text-types';
import { Link } from 'react-router';
import { cn } from 'lone-star-ui';
import { isInternal } from './primitives';

const options: Options = {
    renderNode: {
        [INLINES.HYPERLINK]: (node, children) => {
            const href = String(node.data.uri ?? '');
            return isInternal(href) ? (
                <Link to={href} prefetch="intent">
                    {children}
                </Link>
            ) : (
                <a href={href} rel="noopener noreferrer" target="_blank">
                    {children}
                </a>
            );
        },
        // Editors sometimes leave an empty paragraph at the end of a document.
        [BLOCKS.PARAGRAPH]: (node, children) =>
            node.content.every(
                (child) => child.nodeType === 'text' && child.value === ''
            ) ? null : (
                <p>{children}</p>
            )
    }
};

export function RichTextBody({ document, className }: { document: Document; className?: string }) {
    return <div className={cn('rich-text', className)}>{documentToReactComponents(document, options)}</div>;
}
