import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataPersistenceService } from '../../services/data-persistence.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  constructor(
    private dataService: DataPersistenceService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.dataService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
  }
}