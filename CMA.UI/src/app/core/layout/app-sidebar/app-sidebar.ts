import { Component } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import {
  lucideHouse,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.html',
  imports: [
    HlmSidebarImports,
    HlmIconImports,
    RouterLink,
    RouterLinkActive,
  ],
  providers: [
    provideIcons({
      lucideHouse,
    }),
  ],
})
export class AppSidebar {
  protected readonly _items = [
    {
      title: 'Configurator',
      url: '/configurator',
      icon: 'lucideHouse',
    },
  ];
}
