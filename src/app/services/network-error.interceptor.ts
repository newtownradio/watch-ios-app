import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const NetworkErrorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Network error intercepted:', error);
      
      let errorMessage = 'Network error occurred. Please try again.';
      
      if (error.status === 0) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      } else if (error.status === 404) {
        errorMessage = 'Service not found. Please try again later.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Please check your credentials.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.status >= 400 && error.status < 500) {
        errorMessage = 'Request failed. Please check your input and try again.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      // Log detailed error information for debugging
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });
      
      // You can also show a user-friendly notification here
      // For now, we'll just return the error with a custom message
      return throwError(() => new Error(errorMessage));
    })
  );
}; 