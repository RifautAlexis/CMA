import { Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { type CellContext, injectFlexRenderContext } from '@tanstack/angular-table';
import { Device } from '../models/device';

@Component({
	imports: [HlmButtonImports, NgIcon, HlmIconImports, HlmDropdownMenuImports],
	providers: [provideIcons({ lucideEllipsis })],
	template: `
		<button hlmBtn variant="ghost" class="h-8 w-8 p-0" [hlmDropdownMenuTrigger]="ActionDropDownMenu">
			<span class="sr-only">Open menu</span>
			<ng-icon hlm size="sm" name="lucideEllipsis" />
		</button>

		<ng-template #ActionDropDownMenu>
			<hlm-dropdown-menu>
				<hlm-dropdown-menu-label>Actions</hlm-dropdown-menu-label>
				<button hlmDropdownMenuItem (click)="editDevice()">Edit</button>
				<button hlmDropdownMenuItem (click)="deleteDevice()">Delete</button>
			</hlm-dropdown-menu>
		</ng-template>
	`,
})
export class ActionDropdownRow {
	private readonly _context = injectFlexRenderContext<CellContext<Device, unknown>>();

	protected readonly deviceToEdit = output<Device>();
	protected readonly deviceToDelete = output<Device>();

	editDevice(): void {
		const device = this._context.row.original;
		this.deviceToEdit.emit(device);
	}

	deleteDevice(): void {
		const device = this._context.row.original;
		this.deviceToDelete.emit(device);
	}
}
