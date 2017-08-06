import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pNumberFormatLocale'
})
export class NumberFormatLocalePipe implements PipeTransform {
  transform(value: any): any {
    value = Number.parseInt(value);
    if (isNaN(value))
      return "";
    return value.toLocaleString();
  }
}

@Pipe({
  name: 'pRoundToDecimalPlace'
})
export class RoundToDecimalPlacePipe implements PipeTransform {
  transform(value: number, count: number): string {
    try {
      return value.toFixed(count);
    }
    catch (error) {
      return "";
    }
  }

} 