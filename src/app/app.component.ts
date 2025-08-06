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
    // Test network connectivity on app start
    this.debugService.testNetworkConnectivity().then(isConnected => {
      this.debugService.log('Network connectivity test result', { isConnected });
    });

    // Test ReSend API connectivity on app start
    this.debugService.testReSendConnectivity().then(isConnected => {
      this.debugService.log('ReSend API connectivity test result', { isConnected });
    });

    // Log system information
    this.debugService.getSystemInfo();

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
  }

  private updateNavigationItems(): void {
    this.navigationItems = this.navigationService.getNavigationItems();
  }

  // Navigation methods using the service
  isSplashPage(): boolean {
    return this.navigationService.isSplashPage();
  }

  isAuthPage(): boolean {
    return this.navigationService.isAuthPage();
  }

  isAuthenticated(): boolean {
    return this.dataService.isAuthenticated();
  }

  toggleMenu(): void {
    this.navigationService.toggleMenu();
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