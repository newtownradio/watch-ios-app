import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataPersistenceService } from '../services/data-persistence.service';
import { User } from '../models/bid.interface';

export interface RoleGuardData {
  roles: string[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private dataService: DataPersistenceService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.dataService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/auth'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required
    }

    // Check if user has required role
    const userRole = this.getUserRole(user);
    
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // User doesn't have required role
    const redirectTo = route.data['redirectTo'] || '/discovery';
    this.router.navigate([redirectTo]);
    return false;
  }

  private getUserRole(user: User): string {
    // Determine user role based on verification status and other factors
    if (user.idVerified) {
      return 'verified';
    }
    
    // Check if user has listings (seller)
    const userListings = this.dataService.getListingsBySeller(user.id);
    if (userListings.length > 0) {
      return 'seller';
    }
    
    // Check if user has bids (buyer)
    const userBids = this.dataService.getBidsByUser(user.id);
    if (userBids.length > 0) {
      return 'buyer';
    }
    
    return 'user'; // Default role
  }
} 