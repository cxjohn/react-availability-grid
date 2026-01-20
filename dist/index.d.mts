import { Dayjs } from 'dayjs';
export { Dayjs } from 'dayjs';

interface TimeGridProps {
    selection: Dayjs[];
    setSelection: (selection: Dayjs[] | ((prevSelection: Dayjs[]) => Dayjs[])) => void;
    startDate: Dayjs;
    endDate: Dayjs;
    intervalSize?: number;
    earliestStart: Dayjs;
    latestEnd: Dayjs;
    /**
     * Optional array of allowed time slots. If provided, only these times will be selectable.
     * If omitted or empty, all future times are allowed.
     *
     * IMPORTANT: This prop should be memoized (useMemo) or be a stable reference to avoid
     * unnecessary re-renders of all cells.
     *
     * @example
     * const allowedTimes = useMemo(() => doctorAvailableSlots, [doctorAvailableSlots]);
     */
    allowedTimes?: Dayjs[];
    onSelectionChange?: (selection: Dayjs[]) => void;
    className?: string;
    style?: React.CSSProperties;
}
declare function TimeGrid({ selection, setSelection, startDate, endDate, intervalSize, earliestStart, latestEnd, allowedTimes, onSelectionChange, className, style, }: TimeGridProps): JSX.Element;

interface ParticipantResponse {
    id: string;
    name: string;
    availability: Dayjs[];
}
interface ParticipantInfo {
    id: string;
    name: string;
}
interface AvailabilityOverlaps {
    byTimestamp: Map<number, ParticipantInfo[]>;
    getParticipants: (time: Dayjs) => ParticipantInfo[];
    getCount: (time: Dayjs) => number;
    totalResponses: number;
}
declare function useAvailabilityOverlaps(responses: ParticipantResponse[]): AvailabilityOverlaps;

interface AggregatedTimeGridProps {
    responses: ParticipantResponse[];
    startDate: Dayjs;
    endDate: Dayjs;
    intervalSize?: number;
    earliestStart: Dayjs;
    latestEnd: Dayjs;
    onCellHover?: (time: Dayjs, participants: ParticipantInfo[]) => void;
    onCellLeave?: () => void;
    onCellClick?: (time: Dayjs, participants: ParticipantInfo[]) => void;
    className?: string;
    style?: React.CSSProperties;
}
declare function AggregatedTimeGrid({ responses, startDate, endDate, intervalSize, earliestStart, latestEnd, onCellHover, onCellLeave, onCellClick, className, style, }: AggregatedTimeGridProps): JSX.Element;

export { AggregatedTimeGrid, type AggregatedTimeGridProps, type AvailabilityOverlaps, type ParticipantInfo, type ParticipantResponse, TimeGrid, type TimeGridProps, useAvailabilityOverlaps };
