import { Pipe, PipeTransform } from '@angular/core';

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;
const MONTH = 2592000;
const YEAR = 31536000;

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 0) return 'in the future';
    if (diffSeconds < MINUTE) return 'just now';
    if (diffSeconds < HOUR) return `${Math.floor(diffSeconds / MINUTE)}m ago`;
    if (diffSeconds < DAY) return `${Math.floor(diffSeconds / HOUR)}h ago`;
    if (diffSeconds < WEEK) return `${Math.floor(diffSeconds / DAY)}d ago`;
    if (diffSeconds < MONTH) return `${Math.floor(diffSeconds / WEEK)}w ago`;
    if (diffSeconds < YEAR) return `${Math.floor(diffSeconds / MONTH)}mo ago`;
    return `${Math.floor(diffSeconds / YEAR)}y ago`;
  }
}
