import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', {
          url: request.url,
          method: request.method,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });

        // Log additional details for debugging
        if (error.status === 0) {
          console.error('Network error - possible causes:');
          console.error('- No internet connection');
          console.error('- CORS issue');
          console.error('- Server not reachable');
          console.error('- SSL/TLS certificate issue');
        }

        return throwError(() => error);
      })
    );
  }
}
