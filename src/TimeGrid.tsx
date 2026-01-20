import { useRef, useEffect, useMemo, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import { useFastMouseenter } from "./useFastMouseenter";
import { TimeGridCell } from "./TimeGridCell";
import { TimeGridDay } from "./TimeGridDay";

dayjs.extend(isSameOrBefore);

export interface TimeGridProps {
  selection: Dayjs[];
  setSelection: (
    selection: Dayjs[] | ((prevSelection: Dayjs[]) => Dayjs[])
  ) => void;
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

type SelectionAction = "select" | "unselect" | null;
type SelectionTarget = "day" | "cell" | null;

export default function TimeGrid({
  selection,
  setSelection,
  startDate,
  endDate,
  intervalSize = 60,
  earliestStart,
  latestEnd,
  allowedTimes,
  onSelectionChange,
  className,
  style,
}: TimeGridProps) {
  const selectionAction = useRef<SelectionAction>(null);
  const selectionTarget = useRef<SelectionTarget>(null);
  const fastMouseenter = useFastMouseenter();

  // Wrapper to call both setSelection and onSelectionChange
  const updateSelection = useCallback((
    updater: Dayjs[] | ((prevSelection: Dayjs[]) => Dayjs[])
  ) => {
    setSelection((prev) => {
      const newSelection = typeof updater === 'function' ? updater(prev) : updater;
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      return newSelection;
    });
  }, [setSelection, onSelectionChange]);

  const days = useMemo(() => {
    const daysArray: Dayjs[] = [];
    let currentDay = startDate.clone().startOf('day');
    while (currentDay.isSameOrBefore(endDate, 'day')) {
      daysArray.push(currentDay.clone());
      currentDay = currentDay.add(1, "days");
    }
    return daysArray;
  }, [startDate, endDate]);

  const { hours, startHour, finalHour } = useMemo(() => {
    const start = startDate.clone().hour(earliestStart.hour()).minute(0).second(0).millisecond(0);
    const end = startDate.clone().hour(latestEnd.hour()).minute(0).second(0).millisecond(0);
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

  const handleMouseUp = useCallback(() => {
    selectionAction.current = null;
    selectionTarget.current = null;
    fastMouseenter(false);
  }, [fastMouseenter]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  // Convert selection to Set of timestamps for O(1) lookup performance
  const selectionSet = useMemo(() => {
    return new Set(selection.map(s => s.valueOf()));
  }, [selection]);

  const isInAllowedTimes = useMemo(() => {
    if (allowedTimes && allowedTimes.length > 0) {
      return (dateTime: Dayjs) =>
        allowedTimes.some((allowedTime) => dateTime.isSame(allowedTime));
    }
    return () => true;
  }, [allowedTimes]);

  const isDisabled = useCallback((dateTime: Dayjs) => {
    const currentTime = dayjs();

    if (dateTime.isBefore(currentTime)) {
      return true;
    }

    return !isInAllowedTimes(dateTime);
  }, [isInAllowedTimes]);

  const handleCellMouseDown = (e: React.MouseEvent, hour: Dayjs, day: Dayjs) => {
    const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
    if (isDisabled(dateTime)) {
      return;
    }

    const isSelected = selectionSet.has(dateTime.valueOf());
    selectionAction.current = isSelected ? "unselect" : "select";
    selectionTarget.current = "cell";

    fastMouseenter(true, e.nativeEvent);
  };

  const handleCellMouseEnter = (hour, day) => {
    const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
    if (selectionTarget.current !== "cell" || isDisabled(dateTime)) {
      return;
    }

    toggleTimeCell(dateTime);
  };

  const handleDayMouseDown = (e: React.MouseEvent, day: Dayjs) => {
    const daySlots = hours
      .filter(
        (hour) =>
          !isDisabled(day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0))
      )
      .map((hour) => day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0));

    const allHoursSelected = daySlots.every((slot) =>
      selectionSet.has(slot.valueOf())
    );
    selectionAction.current = allHoursSelected ? "unselect" : "select";
    selectionTarget.current = "day";

    fastMouseenter(true, e.nativeEvent);
  };

  const handleDayMouseEnter = (day) => {
    if (selectionTarget.current !== "day") {
      return;
    }

    handleDaySelection(day);
  };

  const toggleTimeCell = useCallback((dateTime: Dayjs) => {
    if (isDisabled(dateTime)) {
      return;
    }

    const isSelected = selectionSet.has(dateTime.valueOf());

    if (
      (isSelected && selectionAction.current === "select") ||
      (!isSelected && selectionAction.current === "unselect")
    ) {
      return;
    }

    if (isSelected) {
      // Remove from selection
      updateSelection((prevSelection) => {
        return prevSelection.filter((t) => !t.isSame(dateTime));
      });
    } else {
      // Add to selection
      updateSelection((prevSelection) => {
        return [...prevSelection, dateTime];
      });
    }
  }, [isDisabled, selectionSet, updateSelection]);

  const handleDaySelection = (day) => {
    const daySlots = hours
      .filter(
        (hour) =>
          !isDisabled(day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0))
      )
      .map((hour) => day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0));

    const allHoursSelected = daySlots.every((slot) =>
      selectionSet.has(slot.valueOf())
    );

    if (
      (allHoursSelected && selectionAction.current === "select") ||
      (!allHoursSelected && selectionAction.current === "unselect")
    ) {
      return;
    }

    if (allHoursSelected) {
      updateSelection((prevSelection) => {
        return prevSelection.filter((slot) => !slot.isSame(day, "day"));
      });
    } else {
      updateSelection((prevSelection) => {
        return [...prevSelection, ...daySlots];
      });
    }
  };

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, hour: Dayjs, day: Dayjs) => {
    const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);

    // Handle selection with Space or Enter
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleTimeCell(dateTime);
      return;
    }

    // Handle arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();

      const currentDayIndex = days.findIndex(d => d.isSame(day, 'day'));
      const currentHourIndex = hours.findIndex(h => h.isSame(hour, 'hour'));

      let newDayIndex = currentDayIndex;
      let newHourIndex = currentHourIndex;

      if (e.key === 'ArrowLeft') {
        newDayIndex = Math.max(0, currentDayIndex - 1);
      } else if (e.key === 'ArrowRight') {
        newDayIndex = Math.min(days.length - 1, currentDayIndex + 1);
      } else if (e.key === 'ArrowUp') {
        newHourIndex = Math.max(0, currentHourIndex - 1);
      } else if (e.key === 'ArrowDown') {
        newHourIndex = Math.min(hours.length - 1, currentHourIndex + 1);
      }

      // Focus the new cell
      if (newDayIndex !== currentDayIndex || newHourIndex !== currentHourIndex) {
        const newDay = days[newDayIndex];
        const newHour = hours[newHourIndex];

        // Find and focus the cell element
        const cellKey = `cell-${newHour.format("H:mm")}-${newDay.format("ddd D")}`;
        const cellElement = document.querySelector(`[data-cell-key="${cellKey}"]`) as HTMLElement;
        if (cellElement) {
          cellElement.focus();
        }
      }
    }
  }, [days, hours, toggleTimeCell]);

  const rootClassName = ['timegrid', className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClassName}
      style={style}
      role="grid"
      aria-label="Time availability grid"
      aria-multiselectable="true"
    >
      <div className="timegrid-header" role="row">
        {days.map((day) => (
          <TimeGridDay
            key={`day-${day.format("ddd D")}`}
            day={day}
            handleMouseDown={handleDayMouseDown}
            handleMouseEnter={handleDayMouseEnter}
          />
        ))}
      </div>
      {hours.map((hour) => (
        <div key={`hour-${hour.format("H:mm")}`} className="timegrid-row" role="row">
          {days.map((day) => {
            return (
              <TimeGridCell
                key={`cell-${hour.format("H:mm")}-${day.format("ddd D")}`}
                day={day}
                hour={hour}
                startHour={startHour}
                finalHour={finalHour}
                selectionSet={selectionSet}
                isDisabled={isDisabled}
                handleMouseDown={handleCellMouseDown}
                handleMouseEnter={handleCellMouseEnter}
                handleKeyDown={handleCellKeyDown}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
