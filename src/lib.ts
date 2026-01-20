/**
 * TimeGrid - Individual availability selection component
 *
 * Users click and drag to select available time slots across multiple days.
 *
 * @example
 * ```tsx
 * import { TimeGrid } from 'react-availability-grid';
 * import 'react-availability-grid/styles.css';
 *
 * <TimeGrid
 *   selection={selection}
 *   setSelection={setSelection}
 *   startDate={dayjs()}
 *   endDate={dayjs().add(7, 'days')}
 *   earliestStart={dayjs().hour(9).minute(0)}
 *   latestEnd={dayjs().hour(17).minute(0)}
 *   intervalSize={60}
 * />
 * ```
 */
export { default as TimeGrid } from "./TimeGrid";

/**
 * AggregatedTimeGrid - Group availability heatmap component
 *
 * Visualizes when the most people are available using a color gradient.
 * Darker colors indicate more participants available at that time.
 *
 * @example
 * ```tsx
 * import { AggregatedTimeGrid } from 'react-availability-grid';
 * import 'react-availability-grid/styles.css';
 *
 * const responses = [
 *   { id: '1', name: 'Alice', availability: [...] },
 *   { id: '2', name: 'Bob', availability: [...] }
 * ];
 *
 * <AggregatedTimeGrid
 *   responses={responses}
 *   startDate={dayjs()}
 *   endDate={dayjs().add(7, 'days')}
 *   earliestStart={dayjs().hour(9).minute(0)}
 *   latestEnd={dayjs().hour(17).minute(0)}
 *   onCellClick={(time, participants) => {
 *     console.log(`${participants.length} available at ${time.format('h:mm A')}`);
 *   }}
 * />
 * ```
 */
export { default as AggregatedTimeGrid } from "./AggregatedTimeGrid";

/**
 * Hook for analyzing participant availability overlaps
 *
 * Returns methods to query who is available at specific times and find
 * optimal meeting times.
 *
 * @example
 * ```tsx
 * import { useAvailabilityOverlaps } from 'react-availability-grid';
 *
 * const overlaps = useAvailabilityOverlaps(responses);
 * const participants = overlaps.getParticipants(someTime);
 * const count = overlaps.getCount(someTime);
 *
 * // Find best meeting time
 * const best = Array.from(overlaps.byTimestamp.entries())
 *   .sort((a, b) => b[1].length - a[1].length)[0];
 * ```
 */

// Hooks
export { useAvailabilityOverlaps } from "./useAvailabilityOverlaps";

// Types
export type { TimeGridProps } from "./TimeGrid";
export type { AggregatedTimeGridProps } from "./AggregatedTimeGrid";
export type {
  ParticipantResponse,
  ParticipantInfo,
  AvailabilityOverlaps,
} from "./useAvailabilityOverlaps";
export type { Dayjs } from "dayjs";

// Export styles - users need to import this separately
// import 'react-availability-grid/styles.css'
