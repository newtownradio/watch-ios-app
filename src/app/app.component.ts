import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { NetworkStatusService } from './services/network-status.service';
import { DebugService } from './services/debug.service';
import { NavigationService, NavigationItem } from './services/navigation.service';
import { DataPersistenceService } from './services/data-persistence.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Watch Style iOS';

  private networkStatusService = inject(NetworkStatusService);
  private debugService = inject(DebugService);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  private dataService = inject(DataPersistenceService);
  private destroy$ = new Subject<void>();

  // Navigation state
  isMenuOpen = false;
  navigationItems: NavigationItem[] = [];
  currentRoute = '';

  ngOnInit() {
    // Initialize navigation
    this.initializeNavigation();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeNavigation(): void {
    // Subscribe to menu state changes
    this.navigationService.getMenuState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isMenuOpen = isOpen;
      });

    // Subscribe to route changes
    this.navigationService.getCurrentRouteObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(route => {
        this.currentRoute = route;
        this.updateNavigationItems();
      });

    // Get initial navigation items
    this.updateNavigationItems();
    
    // Force update navigation items after a short delay to handle auth redirects
    setTimeout(() => {
      this.updateNavigationItems();
    }, 100);
  }

  private updateNavigationItems(): void {
    const isAuth = this.dataService.isAuthenticated();
    this.navigationItems = this.navigationService.getNavigationItemsForUser(isAuth);
  }

  // Navigation methods using the service
  isSplashPage(): boolean {
    return this.navigationService.isSplashPage();
  }

  isAuthPage(): boolean {
    return this.router.url.includes('/auth');
  }

  isAuthenticated(): boolean {
    return this.dataService.isAuthenticated();
  }

  toggleMenu(): void {
    alert('Hamburger clicked!');
    this.navigationService.toggleMenu();
  }

  // Check if running on iOS
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }







  closeMenu(): void {
    this.navigationService.closeMenu();
  }

  onMenuLinkClick(path: string): void {
    this.navigationService.navigateToAndCloseMenu(path);
  }

  onOverlayClick(): void {
    this.navigationService.closeMenu();
  }

  // Check if a navigation item is active
  isNavigationItemActive(item: NavigationItem): boolean {
    return item.isActive || false;
  }
}