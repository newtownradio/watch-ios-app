import { Routes } from '@angular/router';
import { DiscoveryComponent } from './pages/discovery/discovery.component';
import { SellComponent } from './pages/sell/sell.component';
import { AccountComponent } from './pages/account/account.component';
import { SplashComponent } from './pages/splash/splash.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'discovery', component: DiscoveryComponent },
  { path: 'sell', component: SellComponent },
  { path: 'account', component: AccountComponent },
  { path: '**', redirectTo: '' }
];