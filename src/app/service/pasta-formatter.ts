import { Injectable } from '@angular/core';
import { PbSegment, PersonalBest } from './run-parser';

const LINE_LENGTH = 40;
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
    for (const segment of pb.segments) {
      lines.push(this.formatSegment(segment));
    }
    lines.push(INNER_BORDER);
    lines.push(this.padStartOrTruncate(this.duration(pb.time)));
    lines.push(OUTER_BORDER);
    lines.push(CODE_BLOCK_DELIMITER);
    return lines.join('\n');
  }

  private formatSegment(segment: PbSegment): string {
    let timePart = ' -';
    if (segment.time !== undefined && segment.previousTime !== undefined) {
      timePart = this.delta(segment.time - segment.previousTime);
    } else if (segment.time !== undefined) {
      timePart = this.duration(segment.time);
    }

    const remainingLen = LINE_LENGTH - timePart.length;
    return `${this.padEndOrTruncate(segment.name, remainingLen)}${timePart}`;
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
    
    const millisecondPart = `${Math.trunc(milliseconds / 100)}`.padStart(1, '0');
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
