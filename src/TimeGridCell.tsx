import { Dayjs } from "dayjs";
import { useRef } from "react";
import { useEventListener } from './useEventListener';

interface TimeGridCellProps {
  day: Dayjs;
  hour: Dayjs;
  startHour: Dayjs,
  finalHour: Dayjs,
  selectionSet: Set<number>;
  isDisabled: (dateTime: Dayjs) => boolean;
  handleMouseDown: (e: React.MouseEvent, hour: Dayjs, day: Dayjs) => void,
  handleMouseEnter: (hour: Dayjs, day: Dayjs) => void,
  handleKeyDown?: (e: React.KeyboardEvent, hour: Dayjs, day: Dayjs) => void,
}

export function TimeGridCell({
  day,
  hour,
  selectionSet,
  isDisabled,
  handleMouseDown,
  handleMouseEnter,
  handleKeyDown,
  startHour,
  finalHour,
}: TimeGridCellProps) {
  const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
  const isSelected = selectionSet.has(dateTime.valueOf());
  const disabled = isDisabled(dateTime);
  const weekend = day.day() === 0 || day.day() === 6;
  const earliest = hour.isSame(startHour, "hour");
  const lastest = hour.isSame(finalHour, "hour");
  const cellRef = useRef<HTMLDivElement>(null);

  // @ts-ignore
  useEventListener('fastmouseenter', () => {
    handleMouseEnter(hour, day);
  }, cellRef);

  const classNames = [
    'timegrid-cell',
    isSelected && 'selected',
    disabled && 'disabled',
    weekend && 'weekend',
    earliest && 'earliest',
    lastest && 'latest'
  ].filter(Boolean).join(' ');

  const ariaLabel = `${day.format("dddd, MMMM D")} at ${hour.format("h:mm A")}${isSelected ? ', selected' : ''}${disabled ? ', unavailable' : ''}`;
  const cellKey = `cell-${hour.format("H:mm")}-${day.format("ddd D")}`;

  return (
    <div
      ref={cellRef}
      key={cellKey}
      data-cell-key={cellKey}
      className={classNames}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onMouseDown={(e) => handleMouseDown(e, hour, day)}
      onKeyDown={handleKeyDown ? (e) => handleKeyDown(e, hour, day) : undefined}
    >
      {hour.format("H:mm")}
    </div>
  );
}
