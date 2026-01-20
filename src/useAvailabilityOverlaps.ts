import { useMemo } from "react";
import { Dayjs } from "dayjs";

export interface ParticipantResponse {
  id: string;
  name: string;
  availability: Dayjs[];
}

export interface ParticipantInfo {
  id: string;
  name: string;
}

export interface AvailabilityOverlaps {
  byTimestamp: Map<number, ParticipantInfo[]>;
  getParticipants: (time: Dayjs) => ParticipantInfo[];
  getCount: (time: Dayjs) => number;
  totalResponses: number;
}

export function useAvailabilityOverlaps(
  responses: ParticipantResponse[]
): AvailabilityOverlaps {
  return useMemo(() => {
    const byTimestamp = new Map<number, ParticipantInfo[]>();

    responses.forEach(({ id, name, availability }) => {
      availability.forEach((time) => {
        const key = time.valueOf();
        if (!byTimestamp.has(key)) {
          byTimestamp.set(key, []);
        }
        byTimestamp.get(key)!.push({ id, name });
      });
    });

    return {
      byTimestamp,
      getParticipants: (time: Dayjs) => {
        return byTimestamp.get(time.valueOf()) || [];
      },
      getCount: (time: Dayjs) => {
        return byTimestamp.get(time.valueOf())?.length || 0;
      },
      totalResponses: responses.length,
    };
  }, [responses]);
}
