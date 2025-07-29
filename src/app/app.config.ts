import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DataPersistenceService } from './services/data-persistence.service';
import { AiPricingService } from './services/ai-pricing.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    DataPersistenceService,
    AiPricingService
  ]
};