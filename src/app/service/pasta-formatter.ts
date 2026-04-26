import { Injectable } from '@angular/core';
import { PbSegment, PersonalBest } from './run-parser';

const LINE_LENGTH = 40;
const SPLIT_LIMIT = 10;
const CODE_BLOCK_DELIMITER = '```'
const OUTER_BORDER = '='.repeat(LINE_LENGTH);
const INNER_BORDER = '-'.repeat(LINE_LENGTH);

@Injectable({
  providedIn: 'root',
})
export class PastaFormatter {
  makePasta(pb: PersonalBest): string {
    const lines: string[] = [];
    lines.push(CODE_BLOCK_DELIMITER);
    lines.push(OUTER_BORDER);
    lines.push(this.padEndOrTruncate(pb.game));
    lines.push(this.padEndOrTruncate(pb.category));
    lines.push(INNER_BORDER);
    this.formatSegments(lines, pb.segments);
    lines.push(INNER_BORDER);
    lines.push(this.padStartOrTruncate(this.duration(pb.time)));
    lines.push(OUTER_BORDER);
    lines.push(CODE_BLOCK_DELIMITER);
    return lines.join('\n');
  }

  private formatSegments(lines: string[], segments: PbSegment[]) {
    const segmentGroups: SegmentGroup[] = [];
    let currentGroup = new SegmentGroup();
    for (const segment of segments) {
      if (segment.name.startsWith('-')) {
        currentGroup.subsplits.push(segment);
      } else {
        const altNameFormat = segment.name.match(/{(.+)}(.+)/);
        if (altNameFormat) {
          currentGroup.subsplits.push({ ...segment, name: altNameFormat[2] });
          currentGroup.name = altNameFormat[1];
        } else {
          currentGroup.subsplits.push(segment);
          currentGroup.name = segment.name;
        }
        segmentGroups.push(currentGroup);
        currentGroup = new SegmentGroup();
      }
    }

    if (currentGroup.name === undefined && currentGroup.subsplits.length > 0) {
      // subsplits without a parent - the last one is treated as the parent
      const lastSegment = currentGroup.subsplits[currentGroup.subsplits.length - 1];
      currentGroup.name = lastSegment.name;
      segmentGroups.push(currentGroup);
    }

    let remainingSplits = SPLIT_LIMIT;
    const segmentLines: string[] = [];
    const groupCount = segmentGroups.length;
    const lastGroup = segmentGroups[groupCount - 1];
    if (lastGroup.subsplits.length > 1) {
      let i = lastGroup.subsplits.length - 1;
      while (remainingSplits > 1 && i >= 0) {
        const segment = lastGroup.subsplits[i];
        if (i === lastGroup.subsplits.length - 1) {
          segmentLines.push(this.formatSegment(segment, true));
        } else {
          segmentLines.push(this.formatSegment({ ...segment, name: segment.name.substring(1) }, true));
        }
        i--;
        remainingSplits--;
      }
      const name = lastGroup.name!;
      let time = undefined;
      let previousTime = undefined;
      if (groupCount > 1) {
        // the group segment delta is the difference between the delta of the final subsplit and the delta of the final subsplit in the previous group.
        const lastSplit = lastGroup.subsplits[lastGroup.subsplits.length - 1];
        const lastDelta = lastSplit.time && lastSplit.previousTime ?  lastSplit.time - lastSplit.previousTime : undefined;
        const previousGroup = segmentGroups[groupCount - 2];
        const previousSplit = previousGroup.subsplits[previousGroup.subsplits.length - 1];
        const previousDelta = previousSplit.time && previousSplit.previousTime ? previousSplit.time - previousSplit.previousTime : undefined;
        if (lastDelta && previousDelta) {
          time = lastDelta;
          previousTime = previousDelta;
        }
      }
      // this is the line for the group segment.
      segmentLines.push(this.formatSegment({ name, time, previousTime }));
    } else {
      // one-segment groups are just ordinary segments.
      segmentLines.push(this.formatSegment(lastGroup.subsplits[0]));
    }
    remainingSplits--;
    let i = groupCount - 2;
    while (remainingSplits > 0 && i >= 0) {
      // previous groups are displayed as though they're ordinary segments.
      const group = segmentGroups[i--];
      const groupSplit = group.subsplits[group.subsplits.length - 1];
      segmentLines.push(this.formatSegment({ ...groupSplit, name: group.name! }));
      remainingSplits--;
    }

    for (let i = segmentLines.length - 1; i >= 0; i--) {
      lines.push(segmentLines[i]);
    }
  }

  private formatSegment(segment: PbSegment, indent = false): string {
    let timePart = '-'.padStart(10);
    if (segment.time !== undefined && segment.previousTime !== undefined) {
      timePart = `${this.delta(segment.time - segment.previousTime)}`.padStart(10);
    }

    const remainingLen = LINE_LENGTH - timePart.length;
    const prefix = indent ? '  ' : '';
    const namePart = this.padEndOrTruncate(prefix + segment.name, remainingLen);

    return `${namePart}${timePart}`;
  }

  private delta(totalSeconds: number): string {
    const sign = totalSeconds > 0 ? '+' : '-';
    return `${sign}${this.duration(Math.abs(totalSeconds))}`
  }

  private duration(totalSeconds: number): string {
    let remaining = Math.trunc(totalSeconds * 1000);
    const milliseconds = remaining % 1000;
    remaining = Math.trunc(remaining / 1000);
    const seconds = remaining % 60;
    remaining = Math.trunc(remaining / 60);
    const minutes = remaining % 60;
    remaining = Math.trunc(remaining / 60);
    const hours = remaining;
    
    const millisecondPart = `${Math.trunc(milliseconds / 100)}`;
    const secondPart = minutes ? `${seconds}.`.padStart(3, '0') : `${seconds}.`;
    const minutePart = hours ? `${minutes}:`.padStart(3, '0') : minutes ? `${minutes}:` : '';
    const hourPart = hours ? `${hours}:` : '';
    return `${hourPart}${minutePart}${secondPart}${millisecondPart}`;
  }

  private padEndOrTruncate(s: string, len: number = LINE_LENGTH, padChar?: string) {
    if (s.length > len) {
      return `${s.substring(0, len - 3)}...`;
    }
    return s.padEnd(len, padChar);
  }

  private padStartOrTruncate(s: string, len: number = LINE_LENGTH, padChar?: string) {
    if (s.length > len) {
      return `${s.substring(0, len - 3)}...`;
    }
    return s.padStart(len, padChar);
  }
}

class SegmentGroup {
  name?: string;
  subsplits: PbSegment[] = [];
}
