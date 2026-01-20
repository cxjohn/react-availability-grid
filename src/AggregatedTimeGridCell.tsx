import { Dayjs } from "dayjs";
import { ParticipantInfo } from "./useAvailabilityOverlaps";
import { getHeatmapColor } from "./utils/colorInterpolation";
import { getContrastTextColor } from "./utils/contrastTextColor";

interface AggregatedTimeGridCellProps {
  day: Dayjs;
  hour: Dayjs;
  startHour: Dayjs;
  finalHour: Dayjs;
  participants: ParticipantInfo[];
  totalResponses: number;
  onCellHover?: (time: Dayjs, participants: ParticipantInfo[]) => void;
  onCellLeave?: () => void;
  onCellClick?: (time: Dayjs, participants: ParticipantInfo[]) => void;
}

export function AggregatedTimeGridCell({
  day,
  hour,
  startHour,
  finalHour,
  participants,
  totalResponses,
  onCellHover,
  onCellLeave,
  onCellClick,
}: AggregatedTimeGridCellProps) {
  const dateTime = day
    .clone()
    .hour(hour.hour())
    .minute(hour.minute())
    .second(0)
    .millisecond(0);

  const weekend = day.day() === 0 || day.day() === 6;
  const earliest = hour.isSame(startHour, "hour");
  const latest = hour.isSame(finalHour, "hour");

  // Calculate dynamic heatmap color based on actual count
  const heatmapColor = getHeatmapColor(participants.length, totalResponses);
  const textColor = getContrastTextColor(heatmapColor);

  const handleMouseEnter = () => {
    if (onCellHover) {
      onCellHover(dateTime, participants);
    }
  };

  const handleMouseLeave = () => {
    if (onCellLeave) {
      onCellLeave();
    }
  };

  const handleClick = () => {
    if (onCellClick) {
      onCellClick(dateTime, participants);
    }
  };

  return (
    <div
      className={`timegrid-cell aggregated ${weekend ? "weekend" : ""} ${
        earliest ? "earliest" : ""
      } ${latest ? "latest" : ""}`}
      data-time={dateTime.format("YYYY-MM-DD HH:mm")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        backgroundColor: heatmapColor,
        color: textColor,
        cursor: onCellClick ? "pointer" : "default",
      }}
      role="gridcell"
      aria-label={`${day.format("dddd, MMMM D")} at ${hour.format(
        "h:mm A",
      )}, ${participants.length} of ${totalResponses} available`}
    >
      {hour.format("H:mm")}
    </div>
  );
}
