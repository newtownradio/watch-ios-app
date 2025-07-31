import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DataPersistenceService } from './services/data-persistence.service';
import { AiPricingService } from './services/ai-pricing.service';
import { NetworkErrorInterceptor } from './services/network-error.interceptor';
import { NetworkStatusService } from './services/network-status.service';
import { DebugService } from './services/debug.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([NetworkErrorInterceptor])
    ),
    DataPersistenceService,
    AiPricingService,
    NetworkStatusService,
    DebugService
  ]
};