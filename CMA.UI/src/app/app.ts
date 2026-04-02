import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { AppSidebar } from './core/layout/app-sidebar/app-sidebar';
import { AppHeader } from './core/layout/app-header/app-header';

@Component({
  selector: 'app-root',
  imports: [AppSidebar, AppHeader, HlmSidebarImports, RouterOutlet],
  host: {
		class: 'block [--header-height:--spacing(14)]',
	},
  templateUrl: './app.html',
})
export class App { }
