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
  transform(value: any): string {
    try {
      var dateParsed;
      if (value instanceof Date)
        dateParsed = value
      else
        dateParsed = new Date(value);

      var elapsedMs = Date.now() - dateParsed.getTime();
      var elapsedMin = elapsedMs / 1000 / 60;
      if (elapsedMin < 60)
        return Math.floor(elapsedMin) + " min";

      var elapsedHr = elapsedMin / 60;
      if (elapsedHr < 24)
        return Math.floor(elapsedHr) + " hr";

      var elapsedDay = Math.floor(elapsedHr / 24);
      if (elapsedDay == 1)
        return elapsedDay + " day";
      else
        return elapsedDay + " days";
    }
    catch (error) {
      return value;
    }
  }
}
