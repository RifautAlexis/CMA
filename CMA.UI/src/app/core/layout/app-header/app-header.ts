import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

@Component({
	selector: 'app-header',
    templateUrl: './app-header.html',
	imports: [HlmSidebarImports, HlmSeparatorImports, HlmBreadCrumbImports, HlmInputGroupImports, NgIcon],
	providers: [provideIcons({ lucideSun, lucideMoon })],
})
export class AppHeader implements OnInit {
	private readonly document = inject(DOCUMENT);

	isDarkMode = false;

	ngOnInit(): void {
		this.isDarkMode = this.document.documentElement.classList.contains('dark');
	}

	toggleDarkMode() {
		this.isDarkMode = !this.isDarkMode;
		this.document.documentElement.classList.toggle('dark', this.isDarkMode);
	}
}