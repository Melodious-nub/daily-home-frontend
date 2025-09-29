import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface HeaderConfig {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private headerConfigSubject = new BehaviorSubject<HeaderConfig>({
    title: '',
    subtitle: undefined,
    showBackButton: false,
    showMenuButton: true
  });

  constructor() {}

  get headerConfig$(): Observable<HeaderConfig> {
    return this.headerConfigSubject.asObservable();
  }

  get currentTitle(): string {
    return this.headerConfigSubject.value.title;
  }

  get currentSubtitle(): string | undefined {
    return this.headerConfigSubject.value.subtitle;
  }

  /**
   * Set the header configuration
   * @param config - Header configuration object
   */
  setHeaderConfig(config: HeaderConfig): void {
    const currentConfig = this.headerConfigSubject.value;
    const newConfig = { ...currentConfig, ...config };
    
    // Only emit if config actually changed
    if (JSON.stringify(currentConfig) !== JSON.stringify(newConfig)) {
      this.headerConfigSubject.next(newConfig);
    }
  }

  /**
   * Set page title with optional subtitle
   * @param title - Page title
   * @param subtitle - Optional subtitle (only for dashboard)
   */
  setPageTitle(title: string, subtitle?: string): void {
    this.setHeaderConfig({
      title,
      subtitle,
      showBackButton: false,
      showMenuButton: true
    });
  }

  /**
   * Set page title for dashboard with welcome subtitle
   * @param subtitle - Optional subtitle for dashboard
   */
  setDashboardTitle(subtitle?: string): void {
    this.setHeaderConfig({
      title: 'Dashboard',
      subtitle: subtitle || 'Welcome to DailyHome',
      showBackButton: false,
      showMenuButton: true
    });
  }

  /**
   * Clear header config (useful for logout or navigation)
   */
  clearHeaderConfig(): void {
    this.setHeaderConfig({
      title: '',
      subtitle: undefined,
      showBackButton: false,
      showMenuButton: true
    });
  }
}
