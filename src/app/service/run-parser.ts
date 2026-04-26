import { Injectable } from '@angular/core';
import { Run, TimeRef } from '../../livesplit-core';

@Injectable({
  providedIn: 'root',
})
export class RunParser {
  async getPersonalBest(splits: File): Promise<PersonalBest> {
    const fileContents = await splits.text();
    using parseResult = Run.parseString(fileContents, '');
    if (!parseResult.parsedSuccessfully()) {
      throw new Error('failed to parse splits file.');
    }
    using run = parseResult.unwrap();
    const game = run.gameName();
    const category = run.categoryName();
    const segments: PbSegment[] = [];
    const segmentCount = run.len();

    if (segmentCount === 0) {
      throw new Error('the splits file is empty.');
    }

    const finalSegment = run.segment(segmentCount - 1);
    const pbTime = finalSegment.personalBestSplitTime();
    const pbRealTime = pbTime.realTime();
    const pbGameTime = pbTime.gameTime();
    if (pbRealTime === null && pbGameTime === null) {
      throw new Error('no personal best time recorded.');
    }
    const useGameTime = pbGameTime !== null;

    // since we pull previous PB from the attempt history, we need to pull PB from there as well.
    // otherwise, a manually-adjusted final split time may cause the PB attempt to get picked as the previous PB
    let pbSeconds = Infinity;
    let pbIndex: number | undefined = undefined;
    let previousPbSeconds = Infinity;
    let previousPbIndex: number | undefined = undefined;
    const attemptCount = run.attemptHistoryLen();
    for (let i = 0; i < attemptCount; i++) {
      const attempt = run.attemptHistoryIndex(i);
      if (attempt.index() < 1) {
        // only use real attempts
        continue;
      }
      const attemptSeconds = this.getSeconds(attempt.time(), useGameTime) ?? Infinity;
      if (attemptSeconds < pbSeconds) {
        previousPbSeconds = pbSeconds;
        previousPbIndex = pbIndex;
        pbSeconds = attemptSeconds;
        pbIndex = attempt.index();
      }
    }

    let sumTime = 0;
    let sumPreviousTime = 0;
    for (let i = 0; i < segmentCount; i++) {
      const segment = run.segment(i);
      const name = segment.name();
      let time = undefined;
      let previousTime = undefined;
      const segmentHistory = segment.segmentHistory().iter();
      let pastSegment = segmentHistory.next();
      while (pastSegment !== null && pastSegment.index() <= pbIndex!) {
        if (previousPbIndex === pastSegment.index()) {
          const pastSegmentTime = this.getSeconds(pastSegment.time(), useGameTime);
          if (pastSegmentTime !== undefined) {
            sumPreviousTime += pastSegmentTime;
            previousTime = sumPreviousTime;
          }
        } else if (pbIndex === pastSegment.index()) {
          const pastSegmentTime = this.getSeconds(pastSegment.time(), useGameTime);
          if (pastSegmentTime !== undefined) {
            sumTime += pastSegmentTime;
            time = sumTime;
          }
        }
        pastSegment = segmentHistory.next();
      }
      segments.push({ name, time, previousTime });
    }

    return { game, category, segments, time: pbSeconds };
  }

  getSeconds(time: TimeRef, useGameTime: boolean): number | undefined {
    return useGameTime ? time.gameTime()?.totalSeconds() : time.realTime()?.totalSeconds();
  }
}

export interface PersonalBest {
  game: string;
  category: string;
  segments: PbSegment[];
  time: number;
}

export interface PbSegment {
  readonly name: string;
  readonly time?: number;
  readonly previousTime?: number;
}
