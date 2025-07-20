import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css'
})
export class BottomNav {

}
