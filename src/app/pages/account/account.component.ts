import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataManagerComponent } from '../../components/data-manager/data-manager.component';
import { DataPersistenceService } from '../../services/data-persistence.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, DataManagerComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private router: Router,
    private dataService: DataPersistenceService
  ) {}

  ngOnInit() {
    this.currentUser = this.dataService.getCurrentUser();
  }

  signOut() {
    this.dataService.logout();
    this.router.navigate(['/auth']);
  }
}