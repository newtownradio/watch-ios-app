import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AuctionTimer {
  listingId: string;
  timeRemaining: string;
  isExpired: boolean;
  hours: number;
  minutes: number;
  seconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionTimerService {
  private timers = new Map<string, BehaviorSubject<AuctionTimer>>();
  private subscriptions = new Map<string, Subscription>();
  private updateInterval = 1000; // Update every second

  /**
   * Start monitoring an auction listing
   */
  startTimer(listingId: string, endTime: Date): Observable<AuctionTimer> {
    // Stop existing timer if any
    this.stopTimer(listingId);

    // Create new timer subject
    const timerSubject = new BehaviorSubject<AuctionTimer>(this.calculateTimeRemaining(endTime));
    this.timers.set(listingId, timerSubject);

    // Start interval updates
    const subscription = interval(this.updateInterval).subscribe(() => {
      const timer = this.calculateTimeRemaining(endTime);
      timerSubject.next(timer);

      // Auto-stop when expired
      if (timer.isExpired) {
        this.stopTimer(listingId);
      }
    });

    this.subscriptions.set(listingId, subscription);

    return timerSubject.asObservable();
  }

  /**
   * Stop monitoring an auction listing
   */
  stopTimer(listingId: string): void {
    const subscription = this.subscriptions.get(listingId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(listingId);
    }

    this.timers.delete(listingId);
  }

  /**
   * Get current timer value for a listing
   */
  getTimer(listingId: string): AuctionTimer | null {
    const timerSubject = this.timers.get(listingId);
    return timerSubject ? timerSubject.value : null;
  }

  /**
   * Calculate time remaining for an auction
   */
  private calculateTimeRemaining(endTime: Date): AuctionTimer {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return {
        listingId: '',
        timeRemaining: 'Expired',
        isExpired: true,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    let timeRemaining: string;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      timeRemaining = `${days}d ${hours % 24}h ${minutes}m`;
    } else if (hours > 0) {
      timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      timeRemaining = `${minutes}m ${seconds}s`;
    } else {
      timeRemaining = `${seconds}s`;
    }

    return {
      listingId: '',
      timeRemaining,
      isExpired: false,
      hours,
      minutes,
      seconds
    };
  }

  /**
   * Format time remaining for display
   */
  formatTimeRemaining(endTime: Date): string {
    const timer = this.calculateTimeRemaining(endTime);
    return timer.timeRemaining;
  }

  /**
   * Check if auction is in final hour (urgent state)
   */
  isInFinalHour(endTime: Date): boolean {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    const oneHour = 1000 * 60 * 60;
    return timeLeft > 0 && timeLeft <= oneHour;
  }

  /**
   * Check if auction is in final 10 minutes (critical state)
   */
  isInFinalMinutes(endTime: Date): boolean {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    const tenMinutes = 1000 * 60 * 10;
    return timeLeft > 0 && timeLeft <= tenMinutes;
  }

  /**
   * Clean up all timers
   */
  cleanup(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
    this.timers.clear();
  }
}
