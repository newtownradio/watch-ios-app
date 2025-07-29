import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isMenuOpen = false;

  ngOnInit() {
    // Component initialization
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}