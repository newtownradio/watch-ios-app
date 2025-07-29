import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ScrollService } from './services/scroll.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isMenuOpen = false;

  constructor(private scrollService: ScrollService) {}

  ngOnInit() {
    // Enable smooth scrolling for iOS
    this.scrollService.enableSmoothScrolling();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScroll();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll() {
    if (this.isMenuOpen) {
      // Don't disable body scroll - let main content scroll naturally
      // Just prevent background interaction
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.pointerEvents = '';
    }
  }

  // Method to scroll to top
  scrollToTop() {
    this.scrollService.scrollToTop();
  }

  // Method to scroll to element
  scrollToElement(elementId: string) {
    this.scrollService.scrollToElement(elementId);
  }
}