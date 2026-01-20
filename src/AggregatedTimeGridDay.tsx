import { Dayjs } from "dayjs";

interface AggregatedTimeGridDayProps {
  day: Dayjs;
}

export function AggregatedTimeGridDay({ day }: AggregatedTimeGridDayProps) {
  return (
    <div
      key={`day-${day.format("ddd D")}`}
      className="timegrid-day"
      role="columnheader"
      aria-label={day.format("dddd, MMMM D, YYYY")}
    >
      {day.format("ddd ")}
      <div className="timegrid-day-number">{day.format("D")}</div>
      {day.format("MMM")}
    </div>
  );
}
