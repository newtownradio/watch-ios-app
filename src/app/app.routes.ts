import { Routes } from '@angular/router';
import { DiscoveryComponent } from './pages/discovery/discovery.component';
import { SellComponent } from './pages/sell/sell.component';
import { AccountComponent } from './pages/account/account.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { SplashComponent } from './pages/splash/splash.component';
import { AuthComponent } from './pages/auth/auth.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { LegalComponent } from './pages/legal/legal.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'discovery', component: DiscoveryComponent },
  { 
    path: 'sell', 
    component: SellComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user', 'seller', 'verified'] }
  },
  { 
    path: 'orders', 
    component: OrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['buyer', 'seller', 'verified'] }
  },
  { 
    path: 'account', 
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'messages', 
    component: MessagesComponent,
    canActivate: [AuthGuard]
  },
  { path: 'legal', component: LegalComponent },
  { path: '**', redirectTo: '' }
];