import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pRedditParse'
})
export class RedditParsePipe implements PipeTransform {
  transform(value: string): any {
    return value.replace(/\*/g, "").replace(/\#/g, "").replace(/\&amp;/g, "").replace(/nbsp;/g, "").replace(/\&lt;/g, "<");
  }
}

@Pipe({
  name: 'pSubstring'
})
export class SubstringPipe implements PipeTransform {
  transform(value: string, start: number, length: number, addEllipsis: boolean = false): any {
    if (addEllipsis)
      if (value.length > length)
        return value.substring(start, length) + "...";
      else
        return value.substring(start, length);
    else
      return value.substring(start, length);
  }
}

// Takes a Date String and returns how long ago it was
@Pipe({
  name: 'pDateStringTimeAgo'
})
export class DateStringTimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    try {
      var dateParsed = new Date(value);
      var elapsedMs = Date.now() - dateParsed.getTime();
      var elapsedMin = elapsedMs / 1000 / 60;
      if (elapsedMin < 60)
        return Math.floor(elapsedMin) + " min ago";

      var elapsedHr = elapsedMin / 60;
      if (elapsedHr < 48)
        return Math.floor(elapsedMin) + " hr ago";

      var elapsedDay = elapsedHr / 24;
      return Math.floor(elapsedDay) + " days ago";
    }
    catch (error) {
      return value;
    }
  }
}
