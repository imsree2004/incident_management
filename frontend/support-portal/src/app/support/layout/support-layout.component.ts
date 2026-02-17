import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-layout',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ IMPORTANT
  templateUrl: './support-layout.component.html',
  styleUrls: ['./support-layout.component.css']
})
export class SupportLayoutComponent {

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/support/login']);
  }
}
