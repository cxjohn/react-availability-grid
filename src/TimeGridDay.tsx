import { useEventListener } from "./useEventListener";
import { Dayjs } from "dayjs";
import { useRef } from "react";

interface TimeGridDayProps {
  day: Dayjs;
  handleMouseDown: (e: React.MouseEvent, day: Dayjs) => void;
  handleMouseEnter: (day: Dayjs) => void;
}

export function TimeGridDay({ day, handleMouseDown, handleMouseEnter }: TimeGridDayProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  // @ts-ignore
  useEventListener('fastmouseenter', () => {
    handleMouseEnter(day);
  }, cellRef);

  return (
    <div
      ref={cellRef}
      key={`day-${day.format("ddd D")}`}
      className="timegrid-day"
      role="columnheader"
      aria-label={day.format("dddd, MMMM D, YYYY")}
      onMouseDown={(e) => handleMouseDown(e, day)}
    >
      {day.format("ddd ")}
      <div className="timegrid-day-number">{day.format("D")}</div>
      {day.format("MMM")}
    </div>
  );
}
