import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-sidebar',
  standalone: true,
  templateUrl: './support-sidebar.component.html',
  styleUrls: ['./support-sidebar.component.css']
})
export class SupportSidebarComponent {

  constructor(private router: Router) {}


}