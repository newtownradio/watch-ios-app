import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, filter } from 'rxjs';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  
  private currentRouteSubject = new BehaviorSubject<string>('');
  public currentRoute$ = this.currentRouteSubject.asObservable();
  
  private menuOpenSubject = new BehaviorSubject<boolean>(false);
  public menuOpen$ = this.menuOpenSubject.asObservable();

  // Navigation items configuration
  private navigationItems: NavigationItem[] = [
    { path: '/discovery', label: 'Discovery', requiresAuth: true },
    { path: '/sell', label: 'Sell', requiresAuth: true },
    { path: '/messages', label: 'Messages', requiresAuth: true },
    { path: '/notifications', label: 'Notifications', requiresAuth: true },
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
      // Removed handleLogout as per edit hint
    } else {
      this.navigateTo(path);
    }
    this.closeMenu();
  }

  // Removed handleLogout as per edit hint

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
} 