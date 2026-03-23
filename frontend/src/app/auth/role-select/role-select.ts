import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-role-select',
  imports: [],
  templateUrl: './role-select.html',
  styleUrl: './role-select.css',
})
export class RoleSelect {
  constructor(private router: Router) {}

goAdmin() {
this.router.navigate(['/admin-login']);
}

goSupport() {
this.router.navigate(['/support-login']);
}
}
