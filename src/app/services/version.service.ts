import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  constructor(private http: HttpClient) {}

  getCurrentVersion(): Observable<string> {
    return this.http.get<string>(`${environment.apiUrl}/version`, { responseType: 'text' as 'json' })
      .pipe(
        map((responseData) => {
          // Ensure the response is a string and trim any extra spaces
          return responseData.trim() || '';
        }),
        catchError((error) => {
          console.error('Error fetching version:', error);
          return of(''); // Return an empty string in case of error
        })
      );
  }
}
