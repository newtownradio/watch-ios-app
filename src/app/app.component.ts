import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataPersistenceService } from './services/data-persistence.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  isAuthenticated = false;
  currentUser: any = null;
  scrollEnabled = false;
  isMenuOpen = false;

  constructor(
    private router: Router,
    private dataService: DataPersistenceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  ngAfterViewInit() {
    // Enhanced scroll enablement for iOS
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.overflowY = 'auto';
      (mainContent.style as any).webkitOverflowScrolling = 'touch';
      mainContent.style.touchAction = 'pan-y'; // Enable vertical finger scrolling
      
      // Enhanced iOS touch event handling
      mainContent.style.webkitUserSelect = 'none';
      mainContent.style.userSelect = 'none';
      (mainContent.style as any).webkitTouchCallout = 'none';
      (mainContent.style as any).webkitTapHighlightColor = 'transparent';
      
      // Force iOS to recognize touch events
      mainContent.style.pointerEvents = 'auto';
      
      // Add touch event listeners for better iOS handling
      mainContent.addEventListener('touchstart', (e) => {
        // Allow default touch behavior for scrolling
        e.stopPropagation();
      }, { passive: true });
      
      mainContent.addEventListener('touchmove', (e) => {
        // Allow default touch behavior for scrolling
        e.stopPropagation();
      }, { passive: true });
      
      // Force scroll to work on iOS
      const forceIOSScroll = () => {
        (mainContent.style as any).webkitOverflowScrolling = 'touch';
        mainContent.style.touchAction = 'pan-y';
        mainContent.style.pointerEvents = 'auto';
      };
      
      // Apply multiple times to ensure it takes effect
      forceIOSScroll();
      setTimeout(forceIOSScroll, 100);
      setTimeout(forceIOSScroll, 500);
      
      // Also handle body and html elements
      const body = document.body;
      const html = document.documentElement;
      
      body.style.touchAction = 'manipulation';
      html.style.touchAction = 'manipulation';
      body.style.webkitUserSelect = 'none';
      html.style.webkitUserSelect = 'none';
    }
  }

  checkAuthentication() {
    this.isAuthenticated = this.dataService.isAuthenticated();
    this.currentUser = this.dataService.getCurrentUser();
    
    // If not authenticated and not on splash or auth page, redirect to auth
    if (!this.isAuthenticated && 
        !this.router.url.includes('/auth') && 
        !this.router.url.includes('/')) {
      this.router.navigate(['/auth']);
    }
  }

  logout() {
    this.dataService.logout();
    this.isAuthenticated = false;
    this.currentUser = null;
    // Immediately redirect to splash and force reload to bypass auth checks
    window.location.href = '/';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onMenuLinkClick() {
    this.closeMenu();
  }

  onOverlayClick() {
    this.closeMenu();
  }

  isSplashPage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  isAuthPage(): boolean {
    return this.router.url.includes('/auth');
  }
}