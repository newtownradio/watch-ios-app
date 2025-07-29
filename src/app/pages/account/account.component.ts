import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataManagerComponent } from '../../components/data-manager/data-manager.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, DataManagerComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  // Account component logic here
}