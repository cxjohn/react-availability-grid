# react-availability-grid

React components for scheduling across groups. Select availability, collect responses, find the best time.

[**Live Demo**](https://stackblitz.com/edit/vitejs-vite-mvu3zk9n?file=src%2FApp.tsx) | [**Minimal Starter**](https://stackblitz.com/edit/vitejs-vite-6agssxzx?file=src%2FApp.tsx)

## What This Library Does

Building a meeting scheduler? Need to find when your team is free? This library handles the entire workflow:

**Step 1: Collect Individual Availability**
Use `TimeGrid` to let each person select when they're free. Users click and drag to mark their available times.

**Step 2: Visualize Group Overlaps**
Use `AggregatedTimeGrid` to see when the most people are available. A heatmap shows you the best meeting times at a glance.

## Features

- **Complete scheduling workflow** - From individual selection to group visualization
- **Drag to select** - Click and drag to quickly select multiple time slots
- **Group availability heatmap** - Darker colors = more people available
- **Lightweight** - Small bundle size (~20KB gzipped)
- **Fully accessible** - ARIA support and complete keyboard navigation
- **Easy to customize** - Style with CSS variables or custom classes
- **TypeScript ready** - Full type definitions included
- **Flexible configuration** - Set intervals, date ranges, and restricted times
- **Modern React** - Built with hooks, works with React 16.8+

## Installation

```bash
npm install react-availability-grid dayjs react react-dom
```

or

```bash
yarn add react-availability-grid dayjs react react-dom
```

## Quick Start

[Open Minimal Starter on StackBlitz](https://stackblitz.com/edit/vitejs-vite-6agssxzx?file=src%2FApp.tsx)

### Collecting Availability (TimeGrid)

Let each person select when they're free:

```tsx
import { useState } from 'react';
import { TimeGrid } from 'react-availability-grid';
import type { Dayjs } from 'react-availability-grid';
import 'react-availability-grid/styles.css';
import dayjs from 'dayjs';

function MyAvailability() {
  const [selection, setSelection] = useState<Dayjs[]>([]);

  return (
    <TimeGrid
      selection={selection}
      setSelection={setSelection}
      startDate={dayjs()}
      endDate={dayjs().add(2, 'weeks')}
      earliestStart={dayjs().hour(9).minute(0)}
      latestEnd={dayjs().hour(17).minute(0)}
    />
  );
}
```

### Finding the Best Time (AggregatedTimeGrid)

After collecting responses, visualize when the most people are available:

```tsx
import { AggregatedTimeGrid } from 'react-availability-grid';
import type { ParticipantResponse } from 'react-availability-grid';
import dayjs from 'dayjs';

function GroupSchedule() {
  const responses: ParticipantResponse[] = [
    {
      id: 'user-1',
      name: 'Alice Chen',
      availability: [
        dayjs().hour(9).minute(0),
        dayjs().hour(10).minute(0),
        dayjs().hour(14).minute(0),
      ],
    },
    {
      id: 'user-2',
      name: 'Bob Smith',
      availability: [
        dayjs().hour(10).minute(0),
        dayjs().hour(14).minute(0),
        dayjs().hour(15).minute(0),
      ],
    },
  ];

  return (
    <AggregatedTimeGrid
      responses={responses}
      startDate={dayjs().startOf('week')}
      endDate={dayjs().endOf('week')}
      earliestStart={dayjs().hour(9).minute(0)}
      latestEnd={dayjs().hour(18).minute(0)}
      onCellClick={(time, participants) => {
        console.log('Schedule at:', time.format('h:mm A'));
        console.log('Available:', participants.map(p => p.name));
      }}
    />
  );
}
```

## Complete Example: Meeting Scheduler

Here's a full workflow showing both components working together:

```tsx
import { useState } from 'react';
import { TimeGrid, AggregatedTimeGrid, useAvailabilityOverlaps } from 'react-availability-grid';
import type { Dayjs, ParticipantResponse, ParticipantInfo } from 'react-availability-grid';
import 'react-availability-grid/styles.css';
import dayjs from 'dayjs';

function MeetingScheduler() {
  // Step 1: Each person fills out their availability
  const [myAvailability, setMyAvailability] = useState<Dayjs[]>([]);

  // Step 2: Collect all responses (typically from your backend)
  const [allResponses, setAllResponses] = useState<ParticipantResponse[]>([
    {
      id: 'user-1',
      name: 'Alice Chen',
      availability: [
        dayjs().hour(9).minute(0),
        dayjs().hour(10).minute(0),
        dayjs().hour(11).minute(0),
      ],
    },
    {
      id: 'user-2',
      name: 'Bob Smith',
      availability: [
        dayjs().hour(10).minute(0),
        dayjs().hour(11).minute(0),
        dayjs().hour(14).minute(0),
      ],
    },
  ]);

  // Step 3: Find overlaps and best times
  const overlaps = useAvailabilityOverlaps(allResponses);
  const [hoveredSlot, setHoveredSlot] = useState<{
    time: Dayjs;
    participants: ParticipantInfo[];
  } | null>(null);

  // Find the best meeting time (most people available)
  const bestTime = Array.from(overlaps.byTimestamp.entries())
    .sort((a, b) => b[1].length - a[1].length)[0];

  return (
    <div>
      <h2>Step 1: When are you available?</h2>
      <TimeGrid
        selection={myAvailability}
        setSelection={setMyAvailability}
        startDate={dayjs().startOf('week')}
        endDate={dayjs().endOf('week')}
        earliestStart={dayjs().hour(9).minute(0)}
        latestEnd={dayjs().hour(18).minute(0)}
      />

      <button onClick={() => {
        // Submit availability to your backend
        const newResponse: ParticipantResponse = {
          id: 'current-user',
          name: 'You',
          availability: myAvailability,
        };
        setAllResponses([...allResponses, newResponse]);
      }}>
        Submit My Availability
      </button>

      <h2>Step 2: Find the best time for everyone</h2>
      <AggregatedTimeGrid
        responses={allResponses}
        startDate={dayjs().startOf('week')}
        endDate={dayjs().endOf('week')}
        earliestStart={dayjs().hour(9).minute(0)}
        latestEnd={dayjs().hour(18).minute(0)}
        onCellHover={(time, participants) => {
          setHoveredSlot({ time, participants });
        }}
        onCellLeave={() => setHoveredSlot(null)}
        onCellClick={(time, participants) => {
          alert(`Schedule meeting at ${time.format('dddd h:mm A')}?\n\nAvailable:\n${participants.map(p => `• ${p.name}`).join('\n')}`);
        }}
      />

      {/* Show details on hover */}
      {hoveredSlot && (
        <div style={{ padding: '20px', background: '#f0f7ff', marginTop: '20px' }}>
          <h3>{hoveredSlot.time.format('dddd, h:mm A')}</h3>
          <p>
            <strong>Available: {hoveredSlot.participants.length}/{allResponses.length}</strong>
            {' '}({Math.round((hoveredSlot.participants.length / allResponses.length) * 100)}%)
          </p>
          {hoveredSlot.participants.length > 0 && (
            <ul>
              {hoveredSlot.participants.map(p => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Show best time */}
      {bestTime && (
        <div style={{ padding: '20px', background: '#e6ffe6', marginTop: '20px' }}>
          <h3>Best Time to Meet</h3>
          <p>
            {dayjs(bestTime[0]).format('dddd, MMMM D [at] h:mm A')}
            <br />
            <strong>{bestTime[1].length}/{allResponses.length} people available</strong>
          </p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### TimeGrid

The component for collecting individual availability.

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `selection` | `Dayjs[]` | Array of selected time slots |
| `setSelection` | `(selection: Dayjs[] \| ((prev: Dayjs[]) => Dayjs[])) => void` | Function to update selection |
| `startDate` | `Dayjs` | First day to display in the grid |
| `endDate` | `Dayjs` | Last day to display in the grid |
| `earliestStart` | `Dayjs` | Earliest time of day to show (e.g., 9:00 AM) |
| `latestEnd` | `Dayjs` | Latest time of day to show (e.g., 5:00 PM) |

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intervalSize` | `number` | `60` | Size of each time slot in minutes |
| `allowedTimes` | `Dayjs[]` | `undefined` | Whitelist of allowed time slots. If omitted, all future times are allowed. **Must be memoized** to avoid re-renders. |
| `onSelectionChange` | `(selection: Dayjs[]) => void` | `undefined` | Callback fired when selection changes |
| `className` | `string` | `undefined` | Additional CSS class for the grid container |
| `style` | `React.CSSProperties` | `undefined` | Inline styles for the grid container |

#### TimeGrid Examples

**30-Minute Intervals**

```tsx
<TimeGrid
  selection={selection}
  setSelection={setSelection}
  startDate={dayjs()}
  endDate={dayjs().add(7, 'days')}
  earliestStart={dayjs().hour(8).minute(0)}
  latestEnd={dayjs().hour(20).minute(0)}
  intervalSize={30}
/>
```

**With Selection Callback**

```tsx
<TimeGrid
  selection={selection}
  setSelection={setSelection}
  startDate={dayjs()}
  endDate={dayjs().add(1, 'week')}
  earliestStart={dayjs().hour(9).minute(0)}
  latestEnd={dayjs().hour(17).minute(0)}
  onSelectionChange={(newSelection) => {
    console.log(`Selected ${newSelection.length} time slots`);
    // Send to analytics, update UI, etc.
  }}
/>
```

**Restrict to Business Hours Only**

```tsx
import { useMemo } from 'react';

function MyScheduler() {
  const [selection, setSelection] = useState<Dayjs[]>([]);

  // IMPORTANT: Memoize allowedTimes to prevent unnecessary re-renders
  const businessHours = useMemo(() => {
    const times: Dayjs[] = [];
    let current = dayjs().startOf('week').add(1, 'day'); // Monday

    while (current.isBefore(dayjs().endOf('week'))) {
      if (current.day() !== 0 && current.day() !== 6) { // Skip weekends
        for (let hour = 9; hour < 17; hour++) {
          times.push(current.hour(hour).minute(0).second(0).millisecond(0));
        }
      }
      current = current.add(1, 'day');
    }

    return times;
  }, []); // Recalculate if date range changes

  return (
    <TimeGrid
      selection={selection}
      setSelection={setSelection}
      startDate={dayjs().startOf('week')}
      endDate={dayjs().endOf('week')}
      earliestStart={dayjs().hour(9).minute(0)}
      latestEnd={dayjs().hour(17).minute(0)}
      allowedTimes={businessHours}
    />
  );
}
```

### AggregatedTimeGrid

The component for visualizing group availability as a heatmap.

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `responses` | `ParticipantResponse[]` | Array of participant availability data |
| `startDate` | `Dayjs` | First day to display |
| `endDate` | `Dayjs` | Last day to display |
| `earliestStart` | `Dayjs` | Earliest time of day |
| `latestEnd` | `Dayjs` | Latest time of day |

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intervalSize` | `number` | `60` | Time slot size in minutes |
| `onCellHover` | `(time: Dayjs, participants: ParticipantInfo[]) => void` | `undefined` | Called when hovering over a cell |
| `onCellLeave` | `() => void` | `undefined` | Called when mouse leaves a cell |
| `onCellClick` | `(time: Dayjs, participants: ParticipantInfo[]) => void` | `undefined` | Called when clicking a cell |
| `className` | `string` | `undefined` | Additional CSS class |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |

#### ParticipantResponse Type

```tsx
interface ParticipantResponse {
  id: string;           // Unique identifier (userId, email, etc.)
  name: string;         // Display name
  availability: Dayjs[]; // Array of available time slots
}
```

#### ParticipantInfo Type

```tsx
interface ParticipantInfo {
  id: string;
  name: string;
}
```

### useAvailabilityOverlaps Hook

For custom visualizations or data analysis, use the `useAvailabilityOverlaps` hook directly:

```tsx
import { useAvailabilityOverlaps } from 'react-availability-grid';

const responses: ParticipantResponse[] = [/* ... */];
const overlaps = useAvailabilityOverlaps(responses);

// Get participants available at a specific time
const participants = overlaps.getParticipants(someTime);
console.log(participants); // [{ id: 'user-1', name: 'Alice' }, ...]

// Get count of available people
const count = overlaps.getCount(someTime);
console.log(count); // 3

// Total number of responses
console.log(overlaps.totalResponses); // 5

// Access raw data (Map of timestamp -> participants)
overlaps.byTimestamp.forEach((participants, timestamp) => {
  console.log(`${participants.length} people at ${dayjs(timestamp).format('h:mm A')}`);
});

// Find best meeting time
const bestTime = Array.from(overlaps.byTimestamp.entries())
  .sort((a, b) => b[1].length - a[1].length)[0];

console.log(`Best time: ${dayjs(bestTime[0]).format('dddd h:mm A')}`);
console.log(`${bestTime[1].length}/${overlaps.totalResponses} available`);
```

#### AvailabilityOverlaps Type

```tsx
interface AvailabilityOverlaps {
  byTimestamp: Map<number, ParticipantInfo[]>;
  getParticipants: (time: Dayjs) => ParticipantInfo[];
  getCount: (time: Dayjs) => number;
  totalResponses: number;
}
```

## Styling & Theming

Both components use CSS variables for easy theming. Import the CSS file and override variables as needed:

### TimeGrid Styling

```css
:root {
  --timegrid-cell-bg: #f0f0f0;
  --timegrid-cell-selected-bg: #346dee5e;
  --timegrid-cell-disabled-color: #c5c5c5ad;
  --timegrid-cell-border-color: #fff;
  --timegrid-cell-text-color: #2f2f2fad;
  --timegrid-day-bg: #f0f0f0;
  --timegrid-day-number-color: #156ff7;
  --timegrid-weekend-bg: #dedee2;
  --timegrid-border-radius: 4px;
  --timegrid-cell-width: 50px;
  --timegrid-cell-height: 25px;
  --timegrid-day-height: 60px;
}
```

### AggregatedTimeGrid Heatmap Colors

The heatmap uses **dynamic gradient interpolation** - each participant count gets its own distinct shade. If you have 5 participants, you'll see 6 distinct colors (0 through 5 people). If you have 50 participants, you'll see 51 distinct colors.

Colors are automatically interpolated between the start and end colors:

```css
:root {
  --timegrid-heatmap-empty: #f5f5f5; /* No participants available */
  --timegrid-heatmap-start: #f5f5f5; /* 1 person available */
  --timegrid-heatmap-end: #2c2c2c;   /* All participants available */
}
```

**How it works:**
- 0 people = `--timegrid-heatmap-empty` (gray)
- 1 person = `--timegrid-heatmap-start`
- N people = gradual interpolation toward `--timegrid-heatmap-end`
- All participants = `--timegrid-heatmap-end`

This provides precise visual feedback: you can immediately distinguish between "3 people available" vs "4 people available" by shade intensity.

### Custom Theme Example

```css
/* Dark theme */
:root {
  --timegrid-cell-bg: #2a2a2a;
  --timegrid-cell-selected-bg: #4a9eff;
  --timegrid-cell-border-color: #1a1a1a;
  --timegrid-cell-text-color: #e0e0e0;
  --timegrid-day-bg: #333;
  --timegrid-weekend-bg: #252525;

  /* Heatmap gradient for dark mode */
  --timegrid-heatmap-empty: #2a2a2a;
  --timegrid-heatmap-start: #1e3a5f;
  --timegrid-heatmap-end: #4a9eff;
}
```

## Accessibility

Both components are built with accessibility in mind:

- **ARIA Roles**: Grids use proper `role="grid"`, `role="row"`, `role="gridcell"`, and `role="columnheader"` attributes
- **Screen Reader Support**: All cells have descriptive `aria-label` attributes announcing the day, time, and selection/availability state
- **Keyboard Navigation** (TimeGrid):
  - **Tab**: Focus cells in sequential order
  - **Arrow Keys**: Navigate between cells (Up/Down for hours, Left/Right for days)
  - **Space/Enter**: Toggle selection of focused cell
- **Focus Management**: Visual focus indicators and proper `tabIndex` management
- **Interactive Feedback**: Hover and click states provide clear visual feedback in both components

## Time Zone Support

This library is **timezone-agnostic**. It respects the timezone of the `dayjs` objects passed to it, giving you full control over how time is displayed.

To handle timezones, ensure all `startDate`, `endDate`, and `selection` objects are converted to the desired target timezone before rendering.

### Local Time Display

To display the grid in the user's local time, convert UTC data to the local timezone.

```tsx
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function LocalTimeScheduler() {
  const userTimezone = dayjs.tz.guess();
  
  // Ensure the grid starts at 00:00 in the user's timezone
  const startDate = dayjs().tz(userTimezone).startOf('week');
  
  // Convert stored UTC data to local time for display
  const localSelection = savedUtcSelection.map(isoString => 
    dayjs(isoString).tz(userTimezone)
  );

  return (
    <div>
      <p>Timezone: {userTimezone}</p>
      <TimeGrid
        startDate={startDate}
        selection={localSelection}
        onSelectionChange={(newSelection) => {
          // Convert back to UTC for storage
          const utcStrings = newSelection.map(d => d.utc().format());
          saveToBackend(utcStrings);
        }}
      />
    </div>
  );
}
```

### Fixed Timezone Display

To enforce a specific timezone (e.g., for a physical event), convert all dates to that timezone.

```tsx
function EventScheduler() {
  const EVENT_TZ = "America/New_York";
  const startDate = dayjs().tz(EVENT_TZ).startOf('week');

  return (
    <div>
      <p>Event Time: {EVENT_TZ}</p>
      <TimeGrid
        startDate={startDate}
        // ...
      />
    </div>
  );
}
```

> **Note**: Always create `startDate` and `endDate` in the target timezone. Creating them in UTC and displaying them in a different timezone may cause the grid to appear shifted (e.g., starting at 7 PM the previous day).

## Browser Support

Works in all modern browsers that support:
- ES6+
- React 16.8+ (Hooks)
- CSS Grid
- CSS Custom Properties

Tested in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## TypeScript

Full TypeScript support included. Import types as needed:

```tsx
import type {
  TimeGridProps,
  AggregatedTimeGridProps,
  ParticipantResponse,
  ParticipantInfo,
  AvailabilityOverlaps,
  Dayjs
} from 'react-availability-grid';

const timeGridProps: TimeGridProps = {
  selection: [],
  setSelection: () => {},
  startDate: dayjs(),
  endDate: dayjs().add(1, 'week'),
  earliestStart: dayjs().hour(9).minute(0),
  latestEnd: dayjs().hour(17).minute(0),
};

const responses: ParticipantResponse[] = [
  {
    id: 'user-1',
    name: 'Alice',
    availability: [dayjs().hour(10).minute(0)],
  },
];
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build library
npm run build:lib

# Run tests
npm test
```

## License

MIT
