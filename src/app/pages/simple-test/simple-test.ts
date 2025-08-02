import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h2>Simple Test Page</h2>
      <p>If you can see this, the app is working!</p>
      <button (click)="testClick()" style="padding: 10px 20px; margin: 10px;">
        Test Button
      </button>
      <p>{{ message }}</p>
    </div>
  `
})
export class SimpleTest {
  message = '';

  testClick() {
    this.message = 'Button clicked! App is working correctly.';
    console.log('Test button clicked - app is working');
  }
} 