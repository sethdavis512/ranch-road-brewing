import { cn } from 'lone-star-ui';

/**
 * Road signage is the brand. Texas Ranch Roads are signed with a white
 * route marker; the taproom sits at mile 8 (and the site runs on React
 * Router 8, which is the joke for anyone who reads this).
 */

type RouteMarkerProps = {
    number: string;
    className?: string;
};

/** The Ranch Road route marker: "RANCH ROAD" over the route number. */
export function RouteMarker({ number, className }: RouteMarkerProps) {
    return (
        <span
            aria-hidden="true"
            className={cn('inline-flex size-[1em] shrink-0 rounded-[0.16em] bg-paper p-[0.06em] text-night ring-1 ring-night/20', className)}
        >
            {/* Sized in em so the whole sign scales with the font size it's given. */}
            <span className="flex size-full flex-col items-center justify-center rounded-[0.1em] border-[0.07em] border-night font-display">
                <span className="text-[0.16em] leading-[0.95] font-extrabold">RANCH</span>
                <span className="text-[0.16em] leading-[0.95] font-extrabold">ROAD</span>
                <span className="text-[0.4em] leading-[0.9] font-black tabular-nums">{number}</span>
            </span>
        </span>
    );
}

type MileMarkerProps = {
    mile: string;
    className?: string;
};

/** A green mile-marker post planted at the edge of the hero. */
export function MileMarker({ mile, className }: MileMarkerProps) {
    return (
        <div aria-hidden="true" className={cn('flex w-16 flex-col items-center', className)}>
            <div className="flex w-full flex-col items-center gap-1 rounded-sm bg-sign px-1 pt-2 pb-3 text-paper ring-2 ring-paper/80">
                <span className="font-display text-sm font-extrabold tracking-widest">MILE</span>
                <span className="font-display text-5xl leading-none font-black">{mile}</span>
            </div>
            <div className="w-2 flex-1 bg-paper/80" />
        </div>
    );
}

type AbvMeterProps = {
    abv: number;
    /** ABV that fills the meter. */
    max?: number;
    className?: string;
};

/** A beer's strength on a short vertical meter. */
export function AbvMeter({ abv, max = 10, className }: AbvMeterProps) {
    const fill = Math.min(abv / max, 1) * 100;

    return (
        <div className={cn('flex items-end gap-2', className)}>
            <div aria-hidden="true" className="relative h-12 w-3 overflow-hidden border-2 border-ink bg-surface">
                {[25, 50, 75].map((tick) => (
                    <span key={tick} className="absolute left-0 h-0.5 w-1.5 bg-ink" style={{ bottom: `${tick}%` }} />
                ))}
                <span className="absolute inset-x-0 bottom-0 bg-longhorn" style={{ height: `${fill}%` }} />
            </div>
            <p className="leading-none">
                <span className="block font-display text-3xl font-black tabular-nums">{abv.toFixed(1)}</span>
                <span className="text-xs font-semibold tracking-widest text-pecan uppercase">% ABV</span>
            </p>
        </div>
    );
}

/** The double yellow center line, used to divide the page like a road. */
export function CenterLine({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn('flex flex-col gap-1 py-0.5', className)}>
            <span className="h-1 bg-stripe" />
            <span className="h-1 bg-stripe" />
        </div>
    );
}

/** A strip of asphalt with a dashed lane line, for the footer's edge. */
export function Asphalt({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn('flex h-8 items-center bg-night', className)}>
            <span
                className="h-1 w-full"
                style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--color-paper) 0 40px, transparent 40px 80px)' }}
            />
        </div>
    );
}
