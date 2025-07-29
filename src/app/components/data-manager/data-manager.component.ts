import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPersistenceService } from '../../services/data-persistence.service';

@Component({
  selector: 'app-data-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-manager">
      <h3>📊 Data Management</h3>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Listings:</span>
          <span class="stat-value">{{ stats.listings }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Watches:</span>
          <span class="stat-value">{{ stats.watches }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Users:</span>
          <span class="stat-value">{{ stats.users }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Favorites:</span>
          <span class="stat-value">{{ stats.totalFavorites }}</span>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn export-btn" (click)="exportData()">
          📤 Export Data
        </button>
      </div>

      <div class="export-result" *ngIf="exportedData">
        <h4>Exported Data (Copy this JSON):</h4>
        <textarea 
          [value]="exportedData" 
          readonly 
          rows="10"
          class="export-textarea"
        ></textarea>
      </div>
    </div>
  `,
  styles: [`
    .data-manager {
      margin-bottom: 30px;
    }

    h3 {
      margin: 0 0 16px 0;
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-item {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }

    .stat-value {
      font-weight: 600;
      color: #1e3a8a;
      font-size: 16px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .action-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .export-btn {
      background: #10b981;
      color: white;
    }

    .export-btn:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }

    .export-result {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
    }

    .export-result h4 {
      margin: 0 0 12px 0;
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
    }

    .export-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      background: #f9fafb;
      resize: vertical;
      color: #374151;
    }
  `]
})
export class DataManagerComponent implements OnInit {
  stats = {
    listings: 14334,
    watches: 0,
    users: 0,
    totalFavorites: 0
  };
  exportedData = '';

  constructor(private dataService: DataPersistenceService) {}

  ngOnInit() {
    this.updateStats();
  }

  updateStats() {
    this.stats = this.dataService.getStorageStats();
  }

  exportData() {
    this.exportedData = this.dataService.exportAllData();
  }
}