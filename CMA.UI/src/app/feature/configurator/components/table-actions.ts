import { Component, inject, signal, viewChild, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronsUp,
  lucideChevronUp,
  lucideCircle,
  lucideCircleCheckBig,
  lucideCircleDashed,
  lucideCircleDot,
  lucideCircleHelp,
  lucideCircleOff,
  lucideCirclePlus,
  lucideGlobe,
  lucideMicVocal,
  lucideSearch,
  lucideSettings2,
  lucideX,
} from '@ng-icons/lucide';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { DeviceStatusPipe } from '../pipes/device-status.pipe';
import { Device, DeviceStatus } from '../models/device';
import { ConfiguratorComponent } from '../configurator.component';
import { StatusDeviceBadge } from './status-device-badge';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { CreateEditDeviceComponent } from './create-edit-device';

@Component({
  selector: 'app-table-actions',
  imports: [
    HlmButton,
    FormsModule,
    HlmInput,
    NgIcon,
    HlmIcon,
    HlmDropdownMenuImports,
    HlmCommandImports,
    BrnCommandImports,
    HlmPopoverImports,
    HlmCheckboxImports,
    DeviceStatusPipe,
    StatusDeviceBadge,
    HlmSheetImports,
    CreateEditDeviceComponent,
  ],
  providers: [
    DeviceStatusPipe,
    provideIcons({
      lucideCheck,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronUp,
      lucideChevronsUp,
      lucideCircle,
      lucideCircleCheckBig,
      lucideCircleDashed,
      lucideCircleDot,
      lucideCircleHelp,
      lucideCircleOff,
      lucideCirclePlus,
      lucideGlobe,
      lucideMicVocal,
      lucideSearch,
      lucideSettings2,
      lucideX,
    }),
  ],
  host: {
    class: 'block',
  },
  template: `
    <div class="wip-table-search flex flex-col justify-between gap-4 sm:flex-row">
      <div class="flex flex-col justify-between gap-4 sm:flex-row">
        <!-- NAME FILTER -->
        <input
          hlmInput
          class="h-8 w-full md:w-80"
          placeholder="Filter names..."
          (input)="nameFilterChange($event)"
        />

        <!-- STATUS FILTER -->
        <hlm-popover
          [state]="_statusState()"
          (stateChanged)="statusStateChanged($event)"
          sideOffset="5"
          closeDelay="100"
          align="start"
        >
          <button hlmBtn hlmPopoverTrigger variant="outline" size="sm" class="border-dashed">
            <ng-icon hlm name="lucideCirclePlus" class="mr-2" size="sm" />
            Status
            @if (_statusFilter().length) {
              <div
                data-orientation="vertical"
                role="none"
                class="bg-border mx-2 h-4 w-[1px] shrink-0"
              ></div>

              <div class="flex gap-1">
                @for (status of _statusFilter(); track status) {
                  <span class="bg-secondary text-secondary-foreground rounded px-1 py-0.5 text-xs">
                    <app-status-device-badge [status]="status"></app-status-device-badge>
                  </span>
                }
              </div>
            }
          </button>
          <hlm-command *hlmPopoverPortal="let ctx" hlmPopoverContent class="w-[200px] p-0">
            <hlm-command-input placeholder="Search Status" />
            <hlm-command-list>
              <div *hlmCommandEmptyState hlmCommandEmpty>No results found.</div>
              <hlm-command-group>
                @for (status of _statuses(); track status) {
                  <button
                    hlm-command-item
                    [value]="status | deviceStatus"
                    (selected)="statusSelected(status)"
                  >
                    <hlm-checkbox class="mr-2" [checked]="isStatusSelected(status)" />

                    <app-status-device-badge [status]="status"></app-status-device-badge>
                  </button>
                }
              </hlm-command-group>
            </hlm-command-list>
          </hlm-command>
        </hlm-popover>

        @if (_statusFilter().length) {
          <button hlmBtn variant="ghost" size="sm" align="end" (click)="resetFilters()">
            Reset
            <ng-icon hlm name="lucideX" class="ml-2" size="sm" />
          </button>
        }
      </div>

      <div class="flex gap-4">
        <!-- Column visibility -->
        <button hlmBtn variant="outline" align="end" [hlmDropdownMenuTrigger]="menu">
          Columns
          <ng-icon hlm name="lucideChevronDown" class="ml-2" size="sm" />
        </button>
        <ng-template #menu>
          <hlm-dropdown-menu class="w-32">
            @for (column of _hidableColumns; track column.id) {
              <button
                hlmDropdownMenuCheckbox
                class="capitalize"
                [checked]="column.getIsVisible()"
                (triggered)="column.toggleVisibility()"
              >
                <hlm-dropdown-menu-checkbox-indicator />
                {{ column.columnDef.id }}
              </button>
            }
          </hlm-dropdown-menu>
        </ng-template>

        <!-- Create New Device -->
        <button id="edit-profile" hlmBtn variant="outline" (click)="openSheet()">
          <ng-icon hlm name="lucidePlus" size="sm" />
          New Device
        </button>
      </div>
    </div>
    <app-create-edit-device></app-create-edit-device>
  `,
})
export class TableActions {
  private readonly _tableComponent = inject(ConfiguratorComponent);

  public readonly viewChildSheetRef = viewChild(CreateEditDeviceComponent);
  public readonly deviceToEdit = input<Device | undefined>(undefined);

  protected readonly _table = this._tableComponent.table;

  protected readonly _hidableColumns = this._table
    .getAllColumns()
    .filter((column) => column.getCanHide());
  protected readonly _statusFilter = signal<DeviceStatus[]>([]);
  protected readonly _statuses = signal(
    Object.values(DeviceStatus).filter(
      (status): status is DeviceStatus => typeof status === 'number',
    ),
  );
  protected readonly _statusState = signal<'closed' | 'open'>('closed');

  protected nameFilterChange(event: Event) {
    this._table.getColumn('title')?.setFilterValue((event.target as HTMLInputElement).value);
  }

  openSheet(device?: Device): void {
    this.viewChildSheetRef()?.open(device);
  }

  isStatusSelected(status: DeviceStatus): boolean {
    return this._statusFilter().some((s) => s === status);
  }

  statusStateChanged(state: 'open' | 'closed') {
    this._statusState.set(state);
  }

  statusSelected(status: DeviceStatus): void {
    const current = this._statusFilter();
    const index = current.indexOf(status);
    if (index === -1) {
      this._statusFilter.set([...current, status]);
    } else {
      this._statusFilter.set(current.filter((s) => s !== status));
    }
    this._table.getColumn('status')?.setFilterValue(this._statusFilter());
  }

  resetFilters(): void {
    this._statusFilter.set([]);
    this._table.resetColumnFilters();
  }
}
