// src/TimeGrid.tsx
import { useRef as useRef5, useEffect as useEffect3, useMemo, useCallback as useCallback2 } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

// src/useFastMouseenter.ts
import { useCallback, useEffect, useRef, useState } from "react";
function useFastMouseenter(distance = 15) {
  const [enabled, setEnabled] = useState(false);
  const mousePos = useRef(null);
  const lastEl = useRef(null);
  const updateEl = useCallback((x, y) => {
    const el = document.elementFromPoint(x, y);
    if (el && el !== lastEl.current) {
      lastEl.current = el;
      var evt = new CustomEvent("fastmouseenter");
      el.dispatchEvent(evt);
    }
  }, []);
  const handleMouseMove = useCallback((event) => {
    if (!lastEl.current) {
      updateEl(event.clientX, event.clientY);
    }
    if (!mousePos.current) {
      mousePos.current = { x: event.clientX, y: event.clientY };
      return;
    }
    const { x: x1, y: y1 } = mousePos.current;
    mousePos.current = { x: event.clientX, y: event.clientY };
    const { clientX: x2, clientY: y2 } = event;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < distance) {
      updateEl(event.clientX, event.clientY);
      return;
    }
    const t = distance / d;
    const stepX = Math.trunc(t * dx);
    const stepY = Math.trunc(t * dy);
    const clampX = createClamp(x2, stepX);
    const clampY = createClamp(y2, stepY);
    let simulatedX = clampX(x1 + stepX);
    let simulatedY = clampY(y1 + stepY);
    while (simulatedX !== x2 || simulatedY !== y2) {
      updateEl(simulatedX, simulatedY);
      simulatedX = clampX(simulatedX + stepX);
      simulatedY = clampY(simulatedY + stepY);
    }
  }, [updateEl, distance]);
  useEffect(() => {
    if (enabled) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    } else {
      mousePos.current = null;
      lastEl.current = null;
    }
  }, [enabled, handleMouseMove]);
  const hook = useCallback((enable, e) => {
    setEnabled(enable);
    if (enable && e) {
      updateEl(e.clientX, e.clientY);
      mousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [updateEl]);
  return hook;
}
function createClamp(p2, delta) {
  if (delta > 0) {
    return (p1) => Math.min(p1, p2);
  } else if (delta < 0) {
    return (p1) => Math.max(p1, p2);
  } else {
    return (p1) => p2;
  }
}

// src/TimeGridCell.tsx
import { useRef as useRef3 } from "react";

// src/useEventListener.ts
import { useEffect as useEffect2, useRef as useRef2 } from "react";
function useEventListener(eventName, handler, element) {
  const savedHandler = useRef2(handler);
  useEffect2(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect2(() => {
    const targetElement = element?.current;
    if (!targetElement) return;
    const eventListener = (event) => {
      savedHandler.current(event);
    };
    targetElement.addEventListener(eventName, eventListener);
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// src/TimeGridCell.tsx
import { jsx } from "react/jsx-runtime";
function TimeGridCell({
  day,
  hour,
  selectionSet,
  isDisabled,
  handleMouseDown,
  handleMouseEnter,
  handleKeyDown,
  startHour,
  finalHour
}) {
  const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
  const isSelected = selectionSet.has(dateTime.valueOf());
  const disabled = isDisabled(dateTime);
  const weekend = day.day() === 0 || day.day() === 6;
  const earliest = hour.isSame(startHour, "hour");
  const lastest = hour.isSame(finalHour, "hour");
  const cellRef = useRef3(null);
  useEventListener("fastmouseenter", () => {
    handleMouseEnter(hour, day);
  }, cellRef);
  const classNames = [
    "timegrid-cell",
    isSelected && "selected",
    disabled && "disabled",
    weekend && "weekend",
    earliest && "earliest",
    lastest && "latest"
  ].filter(Boolean).join(" ");
  const ariaLabel = `${day.format("dddd, MMMM D")} at ${hour.format("h:mm A")}${isSelected ? ", selected" : ""}${disabled ? ", unavailable" : ""}`;
  const cellKey = `cell-${hour.format("H:mm")}-${day.format("ddd D")}`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: cellRef,
      "data-cell-key": cellKey,
      className: classNames,
      role: "gridcell",
      "aria-label": ariaLabel,
      "aria-selected": isSelected,
      "aria-disabled": disabled,
      tabIndex: disabled ? -1 : 0,
      onMouseDown: (e) => handleMouseDown(e, hour, day),
      onKeyDown: handleKeyDown ? (e) => handleKeyDown(e, hour, day) : void 0,
      children: hour.format("H:mm")
    },
    cellKey
  );
}

// src/TimeGridDay.tsx
import { useRef as useRef4 } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function TimeGridDay({ day, handleMouseDown, handleMouseEnter }) {
  const cellRef = useRef4(null);
  useEventListener("fastmouseenter", () => {
    handleMouseEnter(day);
  }, cellRef);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: cellRef,
      className: "timegrid-day",
      role: "columnheader",
      "aria-label": day.format("dddd, MMMM D, YYYY"),
      onMouseDown: (e) => handleMouseDown(e, day),
      children: [
        day.format("ddd "),
        /* @__PURE__ */ jsx2("div", { className: "timegrid-day-number", children: day.format("D") }),
        day.format("MMM")
      ]
    },
    `day-${day.format("ddd D")}`
  );
}

// src/TimeGrid.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
dayjs.extend(isSameOrBefore);
function TimeGrid({
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
  style
}) {
  const selectionAction = useRef5(null);
  const selectionTarget = useRef5(null);
  const fastMouseenter = useFastMouseenter();
  const updateSelection = useCallback2((updater) => {
    setSelection((prev) => {
      const newSelection = typeof updater === "function" ? updater(prev) : updater;
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      return newSelection;
    });
  }, [setSelection, onSelectionChange]);
  const days = useMemo(() => {
    const daysArray = [];
    let currentDay = startDate.clone().startOf("day");
    while (currentDay.isSameOrBefore(endDate, "day")) {
      daysArray.push(currentDay.clone());
      currentDay = currentDay.add(1, "days");
    }
    return daysArray;
  }, [startDate, endDate]);
  const { hours, startHour, finalHour } = useMemo(() => {
    const start = startDate.clone().hour(earliestStart.hour()).minute(0).second(0).millisecond(0);
    const end = startDate.clone().hour(latestEnd.hour()).minute(0).second(0).millisecond(0);
    const final = startDate.clone().hour(latestEnd.hour()).subtract(1, "hour").minute(0).second(0).millisecond(0);
    const hoursArray = [];
    let currentHour = start.clone();
    while (currentHour.isBefore(end)) {
      hoursArray.push(currentHour.clone());
      currentHour = currentHour.add(intervalSize, "minutes");
    }
    return { hours: hoursArray, startHour: start, finalHour: final };
  }, [startDate, earliestStart, latestEnd, intervalSize]);
  const handleMouseUp = useCallback2(() => {
    selectionAction.current = null;
    selectionTarget.current = null;
    fastMouseenter(false);
  }, [fastMouseenter]);
  useEffect3(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);
  const selectionSet = useMemo(() => {
    return new Set(selection.map((s) => s.valueOf()));
  }, [selection]);
  const isInAllowedTimes = useMemo(() => {
    if (allowedTimes && allowedTimes.length > 0) {
      return (dateTime) => allowedTimes.some((allowedTime) => dateTime.isSame(allowedTime));
    }
    return () => true;
  }, [allowedTimes]);
  const isDisabled = useCallback2((dateTime) => {
    const currentTime = dayjs();
    if (dateTime.isBefore(currentTime)) {
      return true;
    }
    return !isInAllowedTimes(dateTime);
  }, [isInAllowedTimes]);
  const handleCellMouseDown = (e, hour, day) => {
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
  const handleDayMouseDown = (e, day) => {
    const daySlots = hours.filter(
      (hour) => !isDisabled(day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0))
    ).map((hour) => day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0));
    const allHoursSelected = daySlots.every(
      (slot) => selectionSet.has(slot.valueOf())
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
  const toggleTimeCell = useCallback2((dateTime) => {
    if (isDisabled(dateTime)) {
      return;
    }
    const isSelected = selectionSet.has(dateTime.valueOf());
    if (isSelected && selectionAction.current === "select" || !isSelected && selectionAction.current === "unselect") {
      return;
    }
    if (isSelected) {
      updateSelection((prevSelection) => {
        return prevSelection.filter((t) => !t.isSame(dateTime));
      });
    } else {
      updateSelection((prevSelection) => {
        return [...prevSelection, dateTime];
      });
    }
  }, [isDisabled, selectionSet, updateSelection]);
  const handleDaySelection = (day) => {
    const daySlots = hours.filter(
      (hour) => !isDisabled(day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0))
    ).map((hour) => day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0));
    const allHoursSelected = daySlots.every(
      (slot) => selectionSet.has(slot.valueOf())
    );
    if (allHoursSelected && selectionAction.current === "select" || !allHoursSelected && selectionAction.current === "unselect") {
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
  const handleCellKeyDown = useCallback2((e, hour, day) => {
    const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleTimeCell(dateTime);
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const currentDayIndex = days.findIndex((d) => d.isSame(day, "day"));
      const currentHourIndex = hours.findIndex((h) => h.isSame(hour, "hour"));
      let newDayIndex = currentDayIndex;
      let newHourIndex = currentHourIndex;
      if (e.key === "ArrowLeft") {
        newDayIndex = Math.max(0, currentDayIndex - 1);
      } else if (e.key === "ArrowRight") {
        newDayIndex = Math.min(days.length - 1, currentDayIndex + 1);
      } else if (e.key === "ArrowUp") {
        newHourIndex = Math.max(0, currentHourIndex - 1);
      } else if (e.key === "ArrowDown") {
        newHourIndex = Math.min(hours.length - 1, currentHourIndex + 1);
      }
      if (newDayIndex !== currentDayIndex || newHourIndex !== currentHourIndex) {
        const newDay = days[newDayIndex];
        const newHour = hours[newHourIndex];
        const cellKey = `cell-${newHour.format("H:mm")}-${newDay.format("ddd D")}`;
        const cellElement = document.querySelector(`[data-cell-key="${cellKey}"]`);
        if (cellElement) {
          cellElement.focus();
        }
      }
    }
  }, [days, hours, toggleTimeCell]);
  const rootClassName = ["timegrid", className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: rootClassName,
      style,
      role: "grid",
      "aria-label": "Time availability grid",
      "aria-multiselectable": "true",
      children: [
        /* @__PURE__ */ jsx3("div", { className: "timegrid-header", role: "row", children: days.map((day) => /* @__PURE__ */ jsx3(
          TimeGridDay,
          {
            day,
            handleMouseDown: handleDayMouseDown,
            handleMouseEnter: handleDayMouseEnter
          },
          `day-${day.format("ddd D")}`
        )) }),
        hours.map((hour) => /* @__PURE__ */ jsx3("div", { className: "timegrid-row", role: "row", children: days.map((day) => {
          return /* @__PURE__ */ jsx3(
            TimeGridCell,
            {
              day,
              hour,
              startHour,
              finalHour,
              selectionSet,
              isDisabled,
              handleMouseDown: handleCellMouseDown,
              handleMouseEnter: handleCellMouseEnter,
              handleKeyDown: handleCellKeyDown
            },
            `cell-${hour.format("H:mm")}-${day.format("ddd D")}`
          );
        }) }, `hour-${hour.format("H:mm")}`))
      ]
    }
  );
}

// src/AggregatedTimeGrid.tsx
import { useMemo as useMemo3 } from "react";
import dayjs2 from "dayjs";
import isSameOrBefore2 from "dayjs/plugin/isSameOrBefore.js";

// src/AggregatedTimeGridDay.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function AggregatedTimeGridDay({ day }) {
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: "timegrid-day",
      role: "columnheader",
      "aria-label": day.format("dddd, MMMM D, YYYY"),
      children: [
        day.format("ddd "),
        /* @__PURE__ */ jsx4("div", { className: "timegrid-day-number", children: day.format("D") }),
        day.format("MMM")
      ]
    },
    `day-${day.format("ddd D")}`
  );
}

// src/utils/colorInterpolation.ts
function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, "");
  const fullHex = cleanHex.length === 3 ? cleanHex.split("").map((char) => char + char).join("") : cleanHex;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  return { r, g, b };
}
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function interpolateColor(color1, color2, ratio) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const r = rgb1.r + (rgb2.r - rgb1.r) * clampedRatio;
  const g = rgb1.g + (rgb2.g - rgb1.g) * clampedRatio;
  const b = rgb1.b + (rgb2.b - rgb1.b) * clampedRatio;
  return rgbToHex(r, g, b);
}
function getCSSVariable(variableName, fallback) {
  if (typeof window === "undefined") return fallback;
  const name = variableName.startsWith("--") ? variableName : `--${variableName}`;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
function getHeatmapColor(count, total) {
  if (count === 0) {
    return getCSSVariable("timegrid-heatmap-empty", "#f5f5f5");
  }
  const startColor = getCSSVariable("timegrid-heatmap-start", "#e6f2ff");
  const endColor = getCSSVariable("timegrid-heatmap-end", "#1e5ba8");
  const ratio = total > 1 ? count / total : 1;
  return interpolateColor(startColor, endColor, ratio);
}

// src/utils/contrastTextColor.ts
function getContrastTextColor(hexColor) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#495057" : "#ffffff";
}

// src/AggregatedTimeGridCell.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function AggregatedTimeGridCell({
  day,
  hour,
  startHour,
  finalHour,
  participants,
  totalResponses,
  onCellHover,
  onCellLeave,
  onCellClick
}) {
  const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
  const weekend = day.day() === 0 || day.day() === 6;
  const earliest = hour.isSame(startHour, "hour");
  const latest = hour.isSame(finalHour, "hour");
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
  return /* @__PURE__ */ jsx5(
    "div",
    {
      className: `timegrid-cell aggregated ${weekend ? "weekend" : ""} ${earliest ? "earliest" : ""} ${latest ? "latest" : ""}`,
      "data-time": dateTime.format("YYYY-MM-DD HH:mm"),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
      style: {
        backgroundColor: heatmapColor,
        color: textColor,
        cursor: onCellClick ? "pointer" : "default"
      },
      role: "gridcell",
      "aria-label": `${day.format("dddd, MMMM D")} at ${hour.format(
        "h:mm A"
      )}, ${participants.length} of ${totalResponses} available`,
      children: hour.format("H:mm")
    }
  );
}

// src/useAvailabilityOverlaps.ts
import { useMemo as useMemo2 } from "react";
function useAvailabilityOverlaps(responses) {
  return useMemo2(() => {
    const byTimestamp = /* @__PURE__ */ new Map();
    responses.forEach(({ id, name, availability }) => {
      availability.forEach((time) => {
        const key = time.valueOf();
        if (!byTimestamp.has(key)) {
          byTimestamp.set(key, []);
        }
        byTimestamp.get(key).push({ id, name });
      });
    });
    return {
      byTimestamp,
      getParticipants: (time) => {
        return byTimestamp.get(time.valueOf()) || [];
      },
      getCount: (time) => {
        return byTimestamp.get(time.valueOf())?.length || 0;
      },
      totalResponses: responses.length
    };
  }, [responses]);
}

// src/AggregatedTimeGrid.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
dayjs2.extend(isSameOrBefore2);
function AggregatedTimeGrid({
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
  style
}) {
  const overlaps = useAvailabilityOverlaps(responses);
  const days = useMemo3(() => {
    const daysArray = [];
    let currentDay = startDate.clone().startOf("day");
    while (currentDay.isSameOrBefore(endDate, "day")) {
      daysArray.push(currentDay.clone());
      currentDay = currentDay.add(1, "days");
    }
    return daysArray;
  }, [startDate, endDate]);
  const { hours, startHour, finalHour } = useMemo3(() => {
    const start = startDate.clone().hour(earliestStart.hour()).minute(0).second(0).millisecond(0);
    const end = startDate.clone().hour(latestEnd.hour()).minute(0).second(0).millisecond(0);
    const final = startDate.clone().hour(latestEnd.hour()).subtract(1, "hour").minute(0).second(0).millisecond(0);
    const hoursArray = [];
    let currentHour = start.clone();
    while (currentHour.isBefore(end)) {
      hoursArray.push(currentHour.clone());
      currentHour = currentHour.add(intervalSize, "minutes");
    }
    return { hours: hoursArray, startHour: start, finalHour: final };
  }, [startDate, earliestStart, latestEnd, intervalSize]);
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: `timegrid aggregated-timegrid ${className || ""}`,
      style,
      role: "grid",
      "aria-label": "Aggregated availability grid",
      children: [
        /* @__PURE__ */ jsx6("div", { className: "timegrid-header", role: "row", children: days.map((day) => /* @__PURE__ */ jsx6(AggregatedTimeGridDay, { day }, day.format("YYYY-MM-DD"))) }),
        /* @__PURE__ */ jsx6("div", { className: "timegrid-body", children: hours.map((hour) => /* @__PURE__ */ jsx6("div", { className: "timegrid-row", role: "row", children: days.map((day) => {
          const dateTime = day.clone().hour(hour.hour()).minute(hour.minute()).second(0).millisecond(0);
          const participants = overlaps.getParticipants(dateTime);
          return /* @__PURE__ */ jsx6(
            AggregatedTimeGridCell,
            {
              day,
              hour,
              startHour,
              finalHour,
              participants,
              totalResponses: overlaps.totalResponses,
              onCellHover,
              onCellLeave,
              onCellClick
            },
            `${day.format("YYYY-MM-DD")}-${hour.format("HH:mm")}`
          );
        }) }, hour.format("HH:mm"))) })
      ]
    }
  );
}
export {
  AggregatedTimeGrid,
  TimeGrid,
  useAvailabilityOverlaps
};
//# sourceMappingURL=index.mjs.map