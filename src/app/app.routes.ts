import { Routes } from '@angular/router';
import { DiscoveryComponent } from './pages/discovery/discovery.component';
import { SellComponent } from './pages/sell/sell.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AccountComponent } from './pages/account/account.component';

export const routes: Routes = [
  { path: '', redirectTo: '/discovery', pathMatch: 'full' },
  { path: 'discovery', component: DiscoveryComponent },
  { path: 'sell', component: SellComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'account', component: AccountComponent }
];