import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NetworkStatusService } from './services/network-status.service';
import { DebugService } from './services/debug.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Watch Style iOS';

  private networkStatusService = inject(NetworkStatusService);
  private debugService = inject(DebugService);

  ngOnInit() {
    // Test network connectivity on app start
    this.debugService.testNetworkConnectivity().then(isConnected => {
      this.debugService.log('Network connectivity test result', { isConnected });
    });

    // Test ReSend API connectivity on app start
    this.debugService.testReSendConnectivity().then(isConnected => {
      this.debugService.log('ReSend API connectivity test result', { isConnected });
    });

    // Log system information
    this.debugService.getSystemInfo();
  }
}