import { useState, useMemo } from "react";
import TimeGrid from "./TimeGrid";
import AggregatedTimeGrid from "./AggregatedTimeGrid";
import {
  useAvailabilityOverlaps,
  ParticipantResponse,
  ParticipantInfo,
} from "./useAvailabilityOverlaps";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import "./styles.css"

dayjs.extend(isSameOrBefore);

export default function App() {
  const [selection, setSelection] = useState<Dayjs[]>([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(2, "weeks"));
  const [earliestStart, setEarliestStart] = useState(dayjs().hour(6).minute(0));
  const [latestEnd, setLatestEnd] = useState(dayjs().hour(21).minute(0));
  const [useAllowedTimes, setUseAllowedTimes] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<{
    time: Dayjs;
    participants: ParticipantInfo[];
  } | null>(null);

  // Memoized allowed times - only weekday business hours (9am-5pm, Mon-Fri)
  const allowedTimes = useMemo(() => {
    if (!useAllowedTimes) return undefined;

    const times: Dayjs[] = [];
    let current = startDate.clone();

    while (current.isSameOrBefore(endDate, "day")) {
      // Only weekdays (Mon-Fri)
      if (current.day() >= 1 && current.day() <= 5) {
        // Only 9am-5pm
        for (let hour = 9; hour <= 16; hour++) {
          times.push(
            current.clone().hour(hour).minute(0).second(0).millisecond(0),
          );
        }
      }
      current = current.add(1, "day");
    }

    return times;
  }, [useAllowedTimes, startDate, endDate]);

  // Mock participant responses for AggregatedTimeGrid demo
  const mockResponses: ParticipantResponse[] = useMemo(() => {
    const today = dayjs().startOf("day");

    return [
      {
        id: "user-1",
        name: "Alice Chen",
        availability: [
          today.hour(9).minute(0),
          today.hour(10).minute(0),
          today.hour(11).minute(0),
          today.hour(14).minute(0),
          today.hour(15).minute(0),
          today.add(1, "day").hour(10).minute(0),
          today.add(1, "day").hour(11).minute(0),
          today.add(1, "day").hour(15).minute(0),
        ].map((t) => t.second(0).millisecond(0)),
      },
      {
        id: "user-2",
        name: "Bob Smith",
        availability: [
          today.hour(10).minute(0),
          today.hour(11).minute(0),
          today.hour(14).minute(0),
          today.hour(16).minute(0),
          today.add(1, "day").hour(9).minute(0),
          today.add(1, "day").hour(10).minute(0),
          today.add(1, "day").hour(15).minute(0),
        ].map((t) => t.second(0).millisecond(0)),
      },
      {
        id: "user-3",
        name: "Carol Davis",
        availability: [
          today.hour(10).minute(0),
          today.hour(11).minute(0),
          today.hour(12).minute(0),
          today.hour(15).minute(0),
          today.add(1, "day").hour(10).minute(0),
          today.add(1, "day").hour(14).minute(0),
          today.add(1, "day").hour(15).minute(0),
        ].map((t) => t.second(0).millisecond(0)),
      },
      {
        id: "user-4",
        name: "David Lee",
        availability: [
          today.hour(11).minute(0),
          today.hour(14).minute(0),
          today.hour(15).minute(0),
          today.add(1, "day").hour(10).minute(0),
          today.add(1, "day").hour(15).minute(0),
        ].map((t) => t.second(0).millisecond(0)),
      },
    ];
  }, []);

  // Combine mock responses with Demo User's selection from TimeGrid
  const responses: ParticipantResponse[] = useMemo(() => {
    const demoUser: ParticipantResponse = {
      id: "demo-user",
      name: "Demo User (You)",
      availability: selection.map((t) => t.second(0).millisecond(0)),
    };

    return [...mockResponses, demoUser];
  }, [mockResponses, selection]);

  const overlaps = useAvailabilityOverlaps(responses);

  // Compute date and time ranges from actual response data
  const {
    aggregatedStartDate,
    aggregatedEndDate,
    aggregatedEarliestStart,
    aggregatedLatestEnd,
  } = useMemo(() => {
    // Filter to only responses with availability for computing ranges
    const responsesWithAvailability = responses.filter(
      (r) => r.availability.length > 0,
    );

    if (responsesWithAvailability.length === 0) {
      return {
        aggregatedStartDate: dayjs(),
        aggregatedEndDate: dayjs(),
        aggregatedEarliestStart: dayjs().hour(9).minute(0),
        aggregatedLatestEnd: dayjs().hour(17).minute(0),
      };
    }

    let minDate: Dayjs | null = null;
    let maxDate: Dayjs | null = null;
    let minHour = 24;
    let maxHour = 0;

    responsesWithAvailability.forEach((response) => {
      response.availability.forEach((time) => {
        const dayStart = time.startOf("day");
        if (!minDate || dayStart.isBefore(minDate)) {
          minDate = dayStart;
        }
        if (!maxDate || dayStart.isAfter(maxDate)) {
          maxDate = dayStart;
        }
        if (time.hour() < minHour) {
          minHour = time.hour();
        }
        if (time.hour() > maxHour) {
          maxHour = time.hour();
        }
      });
    });

    return {
      aggregatedStartDate: minDate || dayjs(),
      aggregatedEndDate: maxDate || dayjs(),
      aggregatedEarliestStart: dayjs().hour(minHour).minute(0),
      aggregatedLatestEnd: dayjs()
        .hour(maxHour + 1)
        .minute(0), // +1 to include the last hour
    };
  }, [responses]);

  return (
    <div>
      <div
        style={{ padding: "20px", background: "#f0f0ff", marginBottom: "20px" }}
      >
        <h3>Allowed Times Test</h3>
        <button onClick={() => setUseAllowedTimes(!useAllowedTimes)}>
          {useAllowedTimes ? "Disable" : "Enable"} Allowed Times (Weekdays
          9am-5pm Only)
        </button>
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          Current mode:{" "}
          {useAllowedTimes
            ? `Restricted (${allowedTimes?.length ?? 0} allowed slots)`
            : "All future times allowed"}
        </div>
      </div>

      <div
        style={{ padding: "20px", background: "#f5f5f5", marginBottom: "20px" }}
      >
        <h3>Date Range Controls (Test Dynamic Updates)</h3>
        <button
          onClick={() => {
            setStartDate(dayjs());
            setEndDate(dayjs().add(1, "week"));
          }}
        >
          This Week
        </button>{" "}
        <button
          onClick={() => {
            setStartDate(dayjs());
            setEndDate(dayjs().add(2, "weeks"));
          }}
        >
          Next 2 Weeks
        </button>{" "}
        <button
          onClick={() => {
            setStartDate(dayjs().add(1, "week"));
            setEndDate(dayjs().add(2, "weeks"));
          }}
        >
          Week 2
        </button>{" "}
        <button
          onClick={() => {
            setStartDate(dayjs().add(1, "month"));
            setEndDate(dayjs().add(1, "month").add(1, "week"));
          }}
        >
          Next Month
        </button>
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          Current range: {startDate.format("MMM D")} - {endDate.format("MMM D")}
        </div>
      </div>

      <div
        style={{ padding: "20px", background: "#f5f5f5", marginBottom: "20px" }}
      >
        <h3>Time Range Controls (Test Dynamic Updates)</h3>
        <button
          onClick={() => {
            setEarliestStart(dayjs().hour(9).minute(0));
            setLatestEnd(dayjs().hour(17).minute(0));
          }}
        >
          Business Hours (9am-5pm)
        </button>{" "}
        <button
          onClick={() => {
            setEarliestStart(dayjs().hour(6).minute(0));
            setLatestEnd(dayjs().hour(21).minute(0));
          }}
        >
          Extended (6am-9pm)
        </button>{" "}
        <button
          onClick={() => {
            setEarliestStart(dayjs().hour(8).minute(0));
            setLatestEnd(dayjs().hour(20).minute(0));
          }}
        >
          Regular (8am-8pm)
        </button>{" "}
        <button
          onClick={() => {
            setEarliestStart(dayjs().hour(12).minute(0));
            setLatestEnd(dayjs().hour(18).minute(0));
          }}
        >
          Afternoon (12pm-6pm)
        </button>
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          Current time: {earliestStart.format("h:mm A")} -{" "}
          {latestEnd.format("h:mm A")}
        </div>
      </div>

      <div
        style={{ padding: "20px", background: "#e8f5e9", marginBottom: "20px" }}
      >
        <h3>Your Availability (Demo User)</h3>
        <p style={{ fontSize: "14px", color: "#555" }}>
          Select times below. Your selections will appear in the Aggregated Grid
          as "Demo User (You)".
        </p>
        <p style={{ fontSize: "14px", marginTop: "10px" }}>
          <strong>Selected: {selection.length} slots</strong>
        </p>
      </div>

      <TimeGrid
        selection={selection}
        setSelection={setSelection}
        startDate={startDate}
        endDate={endDate}
        earliestStart={earliestStart}
        latestEnd={latestEnd}
        allowedTimes={allowedTimes}
      />

      <div
        style={{
          marginTop: "40px",
          paddingTop: "40px",
          borderTop: "2px solid #ccc",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          AggregatedTimeGrid Demo - Group Availability
        </h2>
        <div
          style={{
            padding: "20px",
            background: "#fff9e6",
            marginBottom: "20px",
          }}
        >
          <h3>Participants ({responses.length})</h3>
          <ul>
            {responses.map((r) => (
              <li
                key={r.id}
                style={{
                  fontWeight: r.id === "demo-user" ? "bold" : "normal",
                  color: r.id === "demo-user" ? "#2e7d32" : "inherit",
                }}
              >
                <strong>{r.name}</strong> - {r.availability.length} slots
                available
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            Hover over cells to see who's available. Darker colors = more people
            available.
          </div>
        </div>

        <AggregatedTimeGrid
          responses={responses}
          startDate={aggregatedStartDate}
          endDate={aggregatedEndDate}
          earliestStart={aggregatedEarliestStart}
          latestEnd={aggregatedLatestEnd}
          onCellHover={(time, participants) => {
            setHoveredSlot({ time, participants });
          }}
          onCellLeave={() => setHoveredSlot(null)}
          onCellClick={(time, participants) => {
            console.log("Clicked:", time.format("dddd h:mm A"));
            console.log(
              "Available:",
              participants.map((p) => p.name),
            );
            alert(
              `Schedule meeting at ${time.format("dddd h:mm A")}?\n\nAvailable:\n${participants.map((p) => `• ${p.name}`).join("\n")}`,
            );
          }}
        />

        <div
          style={{ marginTop: "20px", padding: "20px", background: "#f5f5f5" }}
        >
          <h3>Hook Data Access</h3>
          <p>Total responses: {overlaps.totalResponses}</p>
          <p>
            Best time (most availability):{" "}
            {(() => {
              let maxCount = 0;
              let bestTimeMs: number | null = null;
              overlaps.byTimestamp.forEach((participants, timestamp) => {
                if (participants.length > maxCount) {
                  maxCount = participants.length;
                  bestTimeMs = timestamp;
                }
              });
              if (bestTimeMs !== null) {
                const bestTime = dayjs(bestTimeMs);
                return `${bestTime.format("dddd h:mm A")} (${maxCount}/${overlaps.totalResponses} available)`;
              }
              return "N/A";
            })()}
          </p>
        </div>

        <div style={{ minHeight: "260px", marginTop: "20px" }}>
          {hoveredSlot && (
            <div
              style={{
                padding: "20px",
                background: "#f0f7ff",
                border: "2px solid #4a9eff",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>
                {hoveredSlot.time.format("dddd, MMMM D [at] h:mm A")}
              </h3>
              <p style={{ marginBottom: "10px", fontSize: "16px" }}>
                <strong>
                  Available: {hoveredSlot.participants.length}/
                  {responses.length}
                </strong>{" "}
                (
                {Math.round(
                  (hoveredSlot.participants.length / responses.length) * 100,
                )}
                %)
              </p>
              {hoveredSlot.participants.length > 0 ? (
                <>
                  <strong>Who's available:</strong>
                  <ul style={{ marginTop: "5px" }}>
                    {hoveredSlot.participants.map((p) => (
                      <li
                        key={p.id}
                        style={{
                          fontWeight: p.id === "demo-user" ? "bold" : "normal",
                          color: p.id === "demo-user" ? "#2e7d32" : "inherit",
                        }}
                      >
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p style={{ color: "#999" }}>
                  No one is available at this time
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
