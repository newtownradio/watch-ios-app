import { Component, HostListener, OnInit, AfterViewInit, ElementRef, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  isMenuOpen = false;
  private elementRef = inject(ElementRef);
  private scrollEnabled = false;

  ngOnInit() {
    // Component initialized - lifecycle hook required
  }

  ngAfterViewInit() {
    // Ensure scroll is enabled after view init - only once
    if (!this.scrollEnabled) {
      this.enableScroll();
      this.scrollEnabled = true;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    console.log('Toggle menu called, current state:', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;
    console.log('New state:', this.isMenuOpen);
  }

  closeMenu() {
    console.log('Close menu called, current state:', this.isMenuOpen);
    this.isMenuOpen = false;
    console.log('Menu closed, new state:', this.isMenuOpen);
  }

  onMenuLinkClick() {
    console.log('Menu link clicked, closing menu');
    this.closeMenu();
  }

  onOverlayClick() {
    console.log('Overlay clicked, closing menu');
    this.closeMenu();
  }

  private enableScroll() {
    // Only enable scroll once and check if element exists
    const mainContent = this.elementRef.nativeElement.querySelector('.main-content');
    if (mainContent && !mainContent.style.overflowY) {
      mainContent.style.overflowY = 'auto';
      mainContent.style.webkitOverflowScrolling = 'touch';
    }
  }
}