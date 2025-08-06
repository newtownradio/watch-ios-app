import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss'
})
export class SplashComponent {
  private router = inject(Router);

  // Both Login and Create Account buttons navigate to auth page
  // Users must authenticate before accessing any features
  navigateToAuth() {
    this.router.navigate(['/auth']);
  }
}