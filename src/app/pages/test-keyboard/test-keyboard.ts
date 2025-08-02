import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';
import { KeyboardHandlerDirective } from '../../core/directives/keyboard-handler.directive';

@Component({
  selector: 'app-test-keyboard',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyboardHandlerDirective],
  template: `
    <div class="test-container">
      <h2>Keyboard & Navigation Test</h2>
      
      <div class="test-section">
        <h3>Input Fields with Keyboard Support</h3>
        <input 
          type="text" 
          placeholder="Test input 1" 
          appKeyboardHandler
          class="test-input"
        />
        <input 
          type="email" 
          placeholder="Test email" 
          appKeyboardHandler
          class="test-input"
        />
        <textarea 
          placeholder="Test textarea" 
          appKeyboardHandler
          class="test-textarea"
        ></textarea>
      </div>

      <div class="test-section">
        <h3>Navigation Controls</h3>
        <button (click)="goBack()" class="test-btn">
          Go Back ({{ canGoBack() ? 'Previous Route' : 'Exit App' }})
        </button>
        <button (click)="hideKeyboard()" class="test-btn">
          Hide Keyboard
        </button>
        <button (click)="showKeyboard()" class="test-btn">
          Show Keyboard
        </button>
      </div>

      <div class="test-section">
        <h3>Navigation History</h3>
        <div class="history-list">
          <div *ngFor="let route of getHistory(); let i = index" class="history-item">
            {{ i + 1 }}. {{ route }}
          </div>
        </div>
      </div>

      <div class="test-section">
        <button (click)="goToDashboard()" class="test-btn primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .test-section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }

    .test-input,
    .test-textarea {
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
    }

    .test-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .test-btn {
      padding: 10px 20px;
      margin: 5px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #f8f9fa;
      cursor: pointer;
      font-size: 14px;
    }

    .test-btn:hover {
      background: #e9ecef;
    }

    .test-btn.primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .test-btn.primary:hover {
      background: #0056b3;
    }

    .history-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 10px;
    }

    .history-item {
      padding: 5px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #666;
    }

    .history-item:last-child {
      border-bottom: none;
    }
  `]
})
export class TestKeyboard {
  constructor(
    private navigationService: NavigationService,
    private router: Router
  ) {}

  canGoBack(): boolean {
    return this.navigationService.canGoBack();
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  hideKeyboard(): void {
    this.navigationService.hideKeyboard();
  }

  showKeyboard(): void {
    this.navigationService.showKeyboard();
  }

  getHistory(): string[] {
    return this.navigationService.getHistory();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
} 