import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distinct'
})
export class DistinctPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.filter((obj, index, self) => 
      index === self.findIndex((t) => (
        t[key] === obj[key]
      ))
    );
  }
}