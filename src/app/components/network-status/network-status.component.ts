import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStatusService, NetworkStatus } from '../../services/network-status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="network-status" [class.offline]="!networkStatus.isOnline">
      <div class="status-indicator">
        <span class="status-dot" [class.online]="networkStatus.isOnline"></span>
        {{ networkStatus.isOnline ? 'Online' : 'Offline' }}
      </div>
      <div class="status-details" *ngIf="showDetails">
        <small>Last checked: {{ networkStatus.lastChecked | date:'short' }}</small>
      </div>
    </div>
  `,
  styles: [`
    .network-status {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .network-status.offline {
      background: rgba(220, 53, 69, 0.9);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #dc3545;
      display: inline-block;
    }

    .status-dot.online {
      background: #28a745;
    }

    .status-details {
      font-size: 10px;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .network-status {
        top: 5px;
        right: 5px;
        padding: 6px 10px;
        font-size: 11px;
      }
    }
  `]
})
export class NetworkStatusComponent implements OnInit, OnDestroy {
  networkStatus: NetworkStatus = {
    isOnline: true,
    lastChecked: new Date()
  };
  
  showDetails = false;
  private subscription: Subscription = new Subscription();

  constructor(private networkStatusService: NetworkStatusService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.networkStatusService.networkStatus$.subscribe(status => {
        this.networkStatus = status;
        console.log('Network status updated:', status);
      })
    );

    // Show details on hover (for debugging)
    this.showDetails = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
} 