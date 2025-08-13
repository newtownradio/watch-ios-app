import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { AuthorizationService } from './authorization.service';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  private authService = inject(AuthorizationService);
  
  private currentRouteSubject = new BehaviorSubject<string>('');
  public currentRoute$ = this.currentRouteSubject.asObservable();
  
  private menuOpenSubject = new BehaviorSubject<boolean>(false);
  public menuOpen$ = this.menuOpenSubject.asObservable();

  // Navigation items configuration with role-based access
  private navigationItems: NavigationItem[] = [
    { path: '/discovery', label: 'Discovery', requiresAuth: false },
    { path: '/sell', label: 'Sell', requiresAuth: true, requiredRoles: ['user', 'seller', 'verified'] },
    { path: '/orders', label: 'Orders', requiresAuth: true, requiredRoles: ['buyer', 'seller', 'verified'] },
    { path: '/messages', label: 'Messages', requiresAuth: true, requiredRoles: ['buyer', 'seller', 'verified'] },
    { path: '/legal', label: 'Legal', requiresAuth: false },
    { path: '/account', label: 'Account', requiresAuth: true }
  ];

  constructor() {
    this.initializeRouteTracking();
  }

  private initializeRouteTracking(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRouteSubject.next(event.url);
      this.updateActiveStates();
    });
  }

  // Get all navigation items
  getNavigationItems(): NavigationItem[] {
    return this.navigationItems.map(item => ({
      ...item,
      isActive: this.isRouteActive(item.path)
    }));
  }

  // Get navigation items based on authentication status and user role
  getNavigationItemsForUser(isAuthenticated: boolean): NavigationItem[] {
    const userRole = this.authService.getUserRole();
    
    return this.navigationItems
      .filter(item => {
        // Check authentication requirement
        if (item.requiresAuth && !isAuthenticated) {
          return false;
        }
        
        // Check role requirements
        if (item.requiredRoles && item.requiredRoles.length > 0) {
          return item.requiredRoles.includes(userRole);
        }
        
        return true;
      })
      .map(item => ({
        ...item,
        isActive: this.isRouteActive(item.path)
      }));
  }

  // Check if a route is currently active
  isRouteActive(path: string): boolean {
    const currentRoute = this.currentRouteSubject.value;
    return currentRoute === path || currentRoute.startsWith(path + '/');
  }

  // Get current route
  getCurrentRoute(): string {
    return this.currentRouteSubject.value;
  }

  // Check if current page is splash
  isSplashPage(): boolean {
    const currentRoute = this.getCurrentRoute();
    return currentRoute === '/' || currentRoute === '';
  }

  // Check if current page is auth
  isAuthPage(): boolean {
    const currentRoute = this.getCurrentRoute();
    return currentRoute.includes('/auth');
  }

  // Navigate to a route
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Navigate to a route and close menu
  navigateToAndCloseMenu(path: string): void {
    if (path === '/logout') {
      // Handle logout
      this.logout();
    } else {
      this.navigateTo(path);
    }
    this.closeMenu();
  }

  // Logout user
  logout(): void {
    // Clear authentication data
    localStorage.removeItem('watch_ios_current_user');
    this.router.navigate(['/auth']);
  }

  // Menu state management
  openMenu(): void {
    this.menuOpenSubject.next(true);
  }

  closeMenu(): void {
    this.menuOpenSubject.next(false);
  }

  toggleMenu(): void {
    const currentState = this.menuOpenSubject.value;
    this.menuOpenSubject.next(!currentState);
  }

  // Get menu state
  isMenuOpen(): boolean {
    return this.menuOpenSubject.value;
  }

  // Update active states for all navigation items
  private updateActiveStates(): void {
    this.navigationItems = this.navigationItems.map(item => ({
      ...item,
      isActive: this.isRouteActive(item.path)
    }));
  }

  // Get menu state as observable
  getMenuState(): Observable<boolean> {
    return this.menuOpen$;
  }

  // Get current route as observable
  getCurrentRouteObservable(): Observable<string> {
    return this.currentRoute$;
  }

  // Check if user can access a specific navigation item
  canAccessNavigationItem(item: NavigationItem): boolean {
    const isAuthenticated = this.authService.getUserRole() !== 'guest';
    
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }
    
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      const userRole = this.authService.getUserRole();
      return item.requiredRoles.includes(userRole);
    }
    
    return true;
  }
} 