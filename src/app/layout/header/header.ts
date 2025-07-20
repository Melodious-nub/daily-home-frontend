import { Component } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatButtonModule
],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}
