import { map } from 'rxjs/operators';
import { HlmSelectImports } from '../../../../libs/ui/select/src/index';
import { HlmTableImports } from '../../../../libs/ui/table/src/index';
import { HlmCardImports } from '../../../../libs/ui/card/src/index';
import { Component, effect, inject, signal, viewChild } from '@angular/core';
import {
  type ColumnDef,
  type ColumnFiltersState,
  createAngularTable,
  flexRenderComponent,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/angular-table';
import {
  TableHeadSelection,
  TableRowSelection,
} from '@shared/components/data-table/selection-column';
import { Device, DeviceStatus } from './models/device';
import { formatDate } from '@angular/common';
import { ActionDropdownRow } from './components/action-dropdown-row';
import { ActionDropdownHeader } from './components/action-dropdown-header';
import { StatusDeviceBadge } from './components/status-device-badge';
import { TableActions } from './components/table-actions';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FormsModule } from '@angular/forms';
import { HlmSpinnerImports } from '../../../../libs/ui/spinner/src/index';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronsLeft,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsRight,
  lucidePlus,
} from '@ng-icons/lucide';
import { ConfiguratorStore } from './services/configurator-store';
import { ConfiguratorHttp } from './services/configurator-http';
import { StoreStatus } from '@shared/models/store-status';
import { CreateDeviceRequest } from './models/create-device';
import { UpdateDeviceRequest } from './models/update-device';
import { StoreAction } from '@shared/models/store-action';

@Component({
  templateUrl: './configurator.html',
  imports: [
    HlmCardImports,
    HlmTableImports,
    FlexRenderDirective,
    TableActions,
    HlmIconImports,
    HlmSelectImports,
    FormsModule,
    HlmSpinnerImports,
  ],
  providers: [
    ConfiguratorHttp,
    ConfiguratorStore,
    provideIcons({
      lucideChevronsLeft,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsRight,
      lucidePlus,
    }),
  ],
  host: {
    class: 'w-full',
  },
})
export class ConfiguratorComponent {
  private readonly _configuratorStore = inject(ConfiguratorStore);
  protected readonly _storeStatus = StoreStatus;
  protected readonly _status = this._configuratorStore.status;

  private readonly _tableActions = viewChild(TableActions);

  protected readonly _deviceToEdit = signal<Device | undefined>(undefined);
  protected readonly _availablePageSizes = [5, 10, 20, 50, 100];
  protected readonly _currentPageSize = signal(this._availablePageSizes[1]); // default to page size 10

  private readonly _dateFormatter = formatDate;
  private readonly _columnFilters = signal<ColumnFiltersState>([]);
  private readonly _sorting = signal<SortingState>([]);
  private readonly _rowSelection = signal<RowSelectionState>({});
  private readonly _pagination = signal<PaginationState>({
    pageSize: this._currentPageSize(),
    pageIndex: 0,
  });

  protected readonly _columns: ColumnDef<Device>[] = [
    {
      id: 'select',
      header: () => flexRenderComponent(TableHeadSelection),
      cell: () => flexRenderComponent(TableRowSelection),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
      enableSorting: true,
      cell: (info) => `<span class="capitalize">${info.getValue<string>()}</span>`,
    },
    {
      accessorKey: 'ipAddress',
      id: 'ipAddress',
      header: 'IP Address',
      enableSorting: true,
      cell: (info) => `<span class="capitalize">${info.getValue<string>()}</span>`,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: (info) =>
        flexRenderComponent(StatusDeviceBadge, {
          inputs: {
            status: info.getValue() as DeviceStatus,
          },
        }),
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      header: 'Created At',
      enableSorting: false,
      cell: (info) => this._dateFormatter(info.getValue<Date>(), 'shortDate', 'fr'),
    },
    {
      accessorKey: 'updatedAt',
      id: 'updatedAt',
      header: 'Updated At',
      enableSorting: false,
      cell: (info) => this._dateFormatter(info.getValue<Date>(), 'shortDate', 'fr'),
    },
    {
      id: 'actions',
      enableHiding: false,
      header: () =>
        flexRenderComponent(ActionDropdownHeader, {
          outputs: {
            deviceToDelete: () => this.deleteDevices(),
          },
        }),
      cell: () =>
        flexRenderComponent(ActionDropdownRow, {
          outputs: {
            deviceToEdit: (device: Device) => this.editDevice(device),
            deviceToDelete: (device: Device) => this.deleteDevice(device),
          },
        }),
    },
  ];

  readonly table = createAngularTable<Device>(() => ({
    data: this._configuratorStore.devices(),
    columns: this._columns,
    state: {
      sorting: this._sorting(),
      columnFilters: this._columnFilters(),
      rowSelection: this._rowSelection(),
      pagination: this._pagination(),
    },
    onSortingChange: (updater) => {
      updater instanceof Function ? this._sorting.update(updater) : this._sorting.set(updater);
    },
    onColumnFiltersChange: (updater) => {
      updater instanceof Function
        ? this._columnFilters.update(updater)
        : this._columnFilters.set(updater);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: (updater) => {
      updater instanceof Function
        ? this._rowSelection.update(updater)
        : this._rowSelection.set(updater);
    },
    onPaginationChange: (updater) => {
      updater instanceof Function
        ? this._pagination.update(updater)
        : this._pagination.set(updater);
    },
  }));

  constructor() {
    effect(() => {
      if(this._configuratorStore.lastAction() === StoreAction.DeleteMultiple && this._configuratorStore.status() === StoreStatus.Success) {
        this.table.setRowSelection({});
      }
    });
  }

  protected createDevice(device: CreateDeviceRequest): void {
    this._configuratorStore.dispatch(StoreAction.Create, device);
  }

  protected updateDevice(device: Device): void {
    const deviceToUpdate: UpdateDeviceRequest = {
      name: device.name,
      ipAddress: device.ipAddress,
    };
    
    this._configuratorStore.dispatch(StoreAction.Update, { ...deviceToUpdate, id: device.id });
  }

  private editDevice(device: Device): void {
    this._tableActions()?.openSheet(device);
  }

  private deleteDevice(device: Device): void {
    this._configuratorStore.dispatch(StoreAction.Delete, { id: device.id });
  }

  private deleteDevices(): void {
    const selectedDeviceIds = this.table.getSelectedRowModel().rows.map((row) => row.original.id);

    this._configuratorStore.dispatch(StoreAction.DeleteMultiple, { ids: selectedDeviceIds });

  }
}
