import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';

// Extend the appConfig to include the HTTP client provider
const extendedAppConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),  // Preserve existing providers
    provideHttpClient(),             // Add HttpClient support
  ],
};

bootstrapApplication(AppComponent, extendedAppConfig)
  .catch((err) => console.error(err));
