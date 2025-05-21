import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';

interface RegisterRequest {
  emailaddress: string;
  password: string;
}

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  
  // Only add token to API requests
  if (request.url.startsWith(environment.apiUrl)) {
    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Clear any existing auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    responseType: 'text' as 'json'
  };

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    if (this.isBrowser) {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && token) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      }
    }
  }

  register(userData: any): Observable<any> {
    console.log('Registering user with data:', userData);
    
    const registerRequest: RegisterRequest = {
      emailaddress: userData.email,
      password: userData.password
    };
    
    console.log('Formatted request:', registerRequest);
    console.log('API URL:', `${this.apiUrl}/Authentication/register`);
    
    return this.http.post(`${this.apiUrl}/Authentication/register`, registerRequest, this.httpOptions).pipe(
      tap(response => {
        console.log('Raw registration response:', response);
        try {
          const jsonResponse = JSON.parse(response as string);
          console.log('Parsed registration response:', jsonResponse);
        } catch (e) {
          console.log('Response is not JSON:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    const loginRequest: RegisterRequest = {
      emailaddress: credentials.email,
      password: credentials.password
    };

    return this.http.post(`${this.apiUrl}/Authentication/login`, loginRequest, this.httpOptions).pipe(
      tap((response: any) => {
        console.log('Raw login response:', response);
        try {
          const jsonResponse = JSON.parse(response as string);
          console.log('Parsed login response:', jsonResponse);
          if (jsonResponse && jsonResponse.token && this.isBrowser) {
            localStorage.setItem('token', jsonResponse.token);
            localStorage.setItem('user', JSON.stringify({
              userId: jsonResponse.userId,
              email: jsonResponse.emailaddress
            }));
            this.currentUserSubject.next({
              userId: jsonResponse.userId,
              email: jsonResponse.emailaddress
            });
          }
        } catch (e) {
          console.log('Response is not JSON:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (typeof error.error === 'string') {
        // Check for specific JWT key size error
        if (error.error.includes('IDX10720') || error.error.includes('Unable to create KeyedHashAlgorithm')) {
          errorMessage = 'Server configuration error: Authentication system is not properly configured. Please contact the administrator.';
          console.error('JWT Key Size Error:', error.error);
        } else {
          // Try to parse other string errors
          try {
            const errorObj = JSON.parse(error.error);
            if (errorObj.message) {
              errorMessage = errorObj.message;
            }
          } catch (e) {
            // If it's not JSON, use the raw error message
            errorMessage = error.error;
          }
        }
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
        errorMessage = error.error.errors.join('\n');
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request data. Please check your input.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please check your credentials.';
        this.router.navigate(['/login']);
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to access this resource.';
        this.router.navigate(['/login']);
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 409) {
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (error.status === 500) {
        if (error.error?.includes('IDX10720')) {
          errorMessage = 'Server configuration error: Authentication system is not properly configured. Please contact the administrator.';
        } else {
          errorMessage = 'Server error. Please try again later.';
        }
        console.error('Server error details:', error);
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('token') : false;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getUser(): any {
    if (this.isBrowser) {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }
}