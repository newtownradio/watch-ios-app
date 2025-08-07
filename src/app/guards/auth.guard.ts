import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataPersistenceService } from '../services/data-persistence.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private dataService: DataPersistenceService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.dataService.isAuthenticated();
    
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      this.router.navigate(['/auth'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    return true;
  }
} 