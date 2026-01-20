import { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import { AggregatedTimeGridDay } from "./AggregatedTimeGridDay";
import { AggregatedTimeGridCell } from "./AggregatedTimeGridCell";
import {
  useAvailabilityOverlaps,
  ParticipantResponse,
  ParticipantInfo,
} from "./useAvailabilityOverlaps";

dayjs.extend(isSameOrBefore);

export interface AggregatedTimeGridProps {
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

export default function AggregatedTimeGrid({
  responses,
  startDate,
  endDate,
  intervalSize = 60,
  earliestStart,
  latestEnd,
  onCellHover,
  onCellLeave,
  onCellClick,
  className,
  style,
}: AggregatedTimeGridProps) {
  const overlaps = useAvailabilityOverlaps(responses);

  const days = useMemo(() => {
    const daysArray: Dayjs[] = [];
    let currentDay = startDate.clone().startOf("day");
    while (currentDay.isSameOrBefore(endDate, "day")) {
      daysArray.push(currentDay.clone());
      currentDay = currentDay.add(1, "days");
    }
    return daysArray;
  }, [startDate, endDate]);

  const { hours, startHour, finalHour } = useMemo(() => {
    const start = startDate
      .clone()
      .hour(earliestStart.hour())
      .minute(0)
      .second(0)
      .millisecond(0);
    const end = startDate
      .clone()
      .hour(latestEnd.hour())
      .minute(0)
      .second(0)
      .millisecond(0);
    const final = startDate
      .clone()
      .hour(latestEnd.hour())
      .subtract(1, "hour")
      .minute(0)
      .second(0)
      .millisecond(0);

    const hoursArray: Dayjs[] = [];
    let currentHour = start.clone();
    while (currentHour.isBefore(end)) {
      hoursArray.push(currentHour.clone());
      currentHour = currentHour.add(intervalSize, "minutes");
    }

    return { hours: hoursArray, startHour: start, finalHour: final };
  }, [startDate, earliestStart, latestEnd, intervalSize]);

  return (
    <div
      className={`timegrid aggregated-timegrid ${className || ""}`}
      style={style}
      role="grid"
      aria-label="Aggregated availability grid"
    >
      <div className="timegrid-header" role="row">
        {days.map((day) => (
          <AggregatedTimeGridDay key={day.format("YYYY-MM-DD")} day={day} />
        ))}
      </div>
      <div className="timegrid-body">
        {hours.map((hour) => (
          <div className="timegrid-row" key={hour.format("HH:mm")} role="row">
            {days.map((day) => {
              const dateTime = day
                .clone()
                .hour(hour.hour())
                .minute(hour.minute())
                .second(0)
                .millisecond(0);
              const participants = overlaps.getParticipants(dateTime);

              return (
                <AggregatedTimeGridCell
                  key={`${day.format("YYYY-MM-DD")}-${hour.format("HH:mm")}`}
                  day={day}
                  hour={hour}
                  startHour={startHour}
                  finalHour={finalHour}
                  participants={participants}
                  totalResponses={overlaps.totalResponses}
                  onCellHover={onCellHover}
                  onCellLeave={onCellLeave}
                  onCellClick={onCellClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
