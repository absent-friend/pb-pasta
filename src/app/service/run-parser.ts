import { Injectable } from '@angular/core';
import { Run, TimeRef } from '../../livesplit-core';

@Injectable({
  providedIn: 'root',
})
export class RunParser {
  async getPersonalBest(splits: File): Promise<PersonalBest> {
    const fileContents = await splits.text();
    const parseResult = Run.parseString(fileContents, '');
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
    const pbSeconds = (useGameTime ? pbGameTime : pbRealTime)!.totalSeconds();

    let previousPbSeconds = Infinity;
    let previousPbIndex: number | undefined = undefined;
    const attemptCount = run.attemptHistoryLen();
    for (let i = 0; i < attemptCount; i++) {
      const attempt = run.attemptHistoryIndex(i);
      const attemptSeconds = this.getSeconds(attempt.time(), useGameTime) ?? Infinity;
      if (attemptSeconds === pbSeconds) {
        break;
      } else if (attemptSeconds < previousPbSeconds) {
        previousPbSeconds = attemptSeconds;
        previousPbIndex = attempt.index();
      }
    }

    let sumPreviousTime = 0;
    segmentLoop: for (let i = 0; i < segmentCount; i++) {
      const segment = run.segment(i);
      const name = segment.name();
      const time = this.getSeconds(segment.personalBestSplitTime(), useGameTime);
      if (previousPbIndex !== undefined) {
        const segmentHistory = segment.segmentHistory().iter();
        let pastSegment = segmentHistory.next();
        while (pastSegment !== null && pastSegment.index() <= previousPbIndex) {
          if (previousPbIndex === pastSegment.index()) {
            const pastSegmentTime = this.getSeconds(pastSegment.time(), useGameTime);
            if (pastSegmentTime) {
              sumPreviousTime += pastSegmentTime;
              segments.push({ name, time, previousTime: sumPreviousTime });
              continue segmentLoop;
            }
          }
          pastSegment = segmentHistory.next();
        }
      }
      segments.push({ name, time });
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
  name: string;
  time?: number;
  previousTime?: number;
}
