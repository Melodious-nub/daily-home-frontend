import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from "../bottom-nav/bottom-nav";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNav, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
}
