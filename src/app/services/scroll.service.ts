import { Injectable } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private isScrolling = false;
  private scrollTimeout: any;

  constructor(private viewportScroller: ViewportScroller) {}

  // Enable smooth scrolling for iOS
  enableSmoothScrolling() {
    // Add iOS-specific scroll improvements
    const style = document.createElement('style');
    style.textContent = `
      .main-content {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* iOS momentum scrolling */
      .main-content::-webkit-scrollbar {
        display: none;
      }
      
      /* Prevent horizontal scroll */
      body {
        overflow-x: hidden;
      }
      
      /* Touch improvements */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      /* Allow text selection in inputs */
      input, textarea {
        -webkit-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);
  }

  // Disable body scroll (for menu overlay)
  disableBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  // Enable body scroll
  enableBodyScroll() {
    document.body.style.overflow = '';
  }

  // Scroll to top with smooth behavior
  scrollToTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  // Scroll to element with smooth behavior
  scrollToElement(elementId: string) {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  // Get current scroll position
  getScrollPosition(): [number, number] {
    return this.viewportScroller.getScrollPosition();
  }

  // Check if user is scrolling
  isUserScrolling(): boolean {
    return this.isScrolling;
  }

  // Set scroll state
  setScrollState(scrolling: boolean) {
    this.isScrolling = scrolling;
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (scrolling) {
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
    }
  }
}