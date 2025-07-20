import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { BottomNav } from "./layout/bottom-nav/bottom-nav";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    BottomNav
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}
