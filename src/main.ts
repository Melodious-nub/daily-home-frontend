import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import '@capacitor-community/safe-area';
import { initialize } from '@capacitor-community/safe-area';

// Initialize Safe Area plugin to ensure CSS variables are available
initialize();

bootstrapApplication(App, appConfig)
  .catch((err) => {
    // console.error(err);
  });
