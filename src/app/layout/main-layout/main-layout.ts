import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from "../bottom-nav/bottom-nav";
import { HeaderComponent } from '../header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNav, HeaderComponent, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
}
