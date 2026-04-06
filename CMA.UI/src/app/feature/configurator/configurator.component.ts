import { HlmSelectImports } from './../../../../libs/ui/select/src/index';
import { HlmTableImports } from './../../../../libs/ui/table/src/index';
import { HlmCardImports } from './../../../../libs/ui/card/src/index';
import { Component, signal, viewChild } from '@angular/core';
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
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronsLeft,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsRight,
  lucidePlus,
} from '@ng-icons/lucide';

@Component({
  templateUrl: './configurator.component.html',
  imports: [
    HlmCardImports,
    HlmTableImports,
    FlexRenderDirective,
    TableActions,
    HlmIconImports,
    HlmSelectImports,
    FormsModule,
  ],
  providers: [
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
                status: (info.getValue() as DeviceStatus)
            }
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
    data: DEVICE_LIST,
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
			updater instanceof Function ? this._pagination.update(updater) : this._pagination.set(updater);
		},
  }));

  private editDevice(device: Device): void {
    this._tableActions()?.openSheet(device);
  }

  private deleteDevice(device: Device): void {
    console.log(device);
  }

  private deleteDevices(): void {
    const selectedDevices = this.table.getSelectedRowModel().rows.map((row) => row.original);

    console.log(selectedDevices);
  }
}


const DEVICE_LIST: Device[] = [
  {
    id: 1,
    name: 'Device-001',
    ipAddress: '192.168.1.101',
    status: 0,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    id: 2,
    name: 'Device-002',
    ipAddress: '192.168.1.102',
    status: 1,
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2026-04-02'),
  },
  {
    id: 3,
    name: 'Device-003',
    ipAddress: '192.168.1.103',
    status: 0,
    createdAt: new Date('2025-03-20'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    id: 4,
    name: 'Device-004',
    ipAddress: '192.168.1.104',
    status: 2,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2026-04-01'),
  },
  {
    id: 5,
    name: 'Device-005',
    ipAddress: '192.168.1.105',
    status: 0,
    createdAt: new Date('2025-06-12'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    id: 6,
    name: 'Device-006',
    ipAddress: '192.168.1.106',
    status: 3,
    createdAt: new Date('2025-04-22'),
    updatedAt: new Date('2026-03-30'),
  },
  {
    id: 7,
    name: 'Device-007',
    ipAddress: '192.168.1.107',
    status: 0,
    createdAt: new Date('2025-07-08'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    id: 8,
    name: 'Device-008',
    ipAddress: '192.168.1.108',
    status: 1,
    createdAt: new Date('2025-05-11'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: 9,
    name: 'Device-009',
    ipAddress: '192.168.1.109',
    status: 0,
    createdAt: new Date('2025-08-03'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    id: 10,
    name: 'Device-010',
    ipAddress: '192.168.1.110',
    status: 2,
    createdAt: new Date('2025-02-28'),
    updatedAt: new Date('2026-04-02'),
  },
  {
    id: 11,
    name: 'Device-011',
    ipAddress: '192.168.1.111',
    status: 0,
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2026-04-04'),
  },
  {
    id: 12,
    name: 'Device-012',
    ipAddress: '192.168.1.112',
    status: 1,
    createdAt: new Date('2025-03-12'),
    updatedAt: new Date('2026-04-01'),
  },
  {
    id: 13,
    name: 'Device-013',
    ipAddress: '192.168.1.113',
    status: 2,
    createdAt: new Date('2025-04-01'),
    updatedAt: new Date('2026-03-28'),
  },
  {
    id: 14,
    name: 'Device-014',
    ipAddress: '192.168.1.114',
    status: 3,
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2026-03-26'),
  },
  {
    id: 15,
    name: 'Device-015',
    ipAddress: '192.168.1.115',
    status: 0,
    createdAt: new Date('2025-05-03'),
    updatedAt: new Date('2026-04-04'),
  },
  {
    id: 16,
    name: 'Device-016',
    ipAddress: '192.168.1.116',
    status: 1,
    createdAt: new Date('2025-05-18'),
    updatedAt: new Date('2026-04-02'),
  },
  {
    id: 17,
    name: 'Device-017',
    ipAddress: '192.168.1.117',
    status: 2,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2026-03-30'),
  },
  {
    id: 18,
    name: 'Device-018',
    ipAddress: '192.168.1.118',
    status: 3,
    createdAt: new Date('2025-06-19'),
    updatedAt: new Date('2026-03-27'),
  },
  {
    id: 19,
    name: 'Device-019',
    ipAddress: '192.168.1.119',
    status: 0,
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2026-04-04'),
  },
  {
    id: 20,
    name: 'Device-020',
    ipAddress: '192.168.1.120',
    status: 1,
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2026-04-01'),
  },
  {
    id: 21,
    name: 'Device-021',
    ipAddress: '192.168.1.121',
    status: 2,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2026-03-29'),
  },
  {
    id: 22,
    name: 'Device-022',
    ipAddress: '192.168.1.122',
    status: 3,
    createdAt: new Date('2025-08-12'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: 23,
    name: 'Device-023',
    ipAddress: '192.168.1.123',
    status: 0,
    createdAt: new Date('2025-09-03'),
    updatedAt: new Date('2026-04-04'),
  },
  {
    id: 24,
    name: 'Device-024',
    ipAddress: '192.168.1.124',
    status: 1,
    createdAt: new Date('2025-09-18'),
    updatedAt: new Date('2026-03-31'),
  },
  {
    id: 25,
    name: 'Device-025',
    ipAddress: '192.168.1.125',
    status: 2,
    createdAt: new Date('2025-10-02'),
    updatedAt: new Date('2026-03-30'),
  },
  {
    id: 26,
    name: 'Device-026',
    ipAddress: '192.168.1.126',
    status: 3,
    createdAt: new Date('2025-10-17'),
    updatedAt: new Date('2026-03-24'),
  },
  {
    id: 27,
    name: 'Device-027',
    ipAddress: '192.168.1.127',
    status: 0,
    createdAt: new Date('2025-11-04'),
    updatedAt: new Date('2026-04-04'),
  },
  {
    id: 28,
    name: 'Device-028',
    ipAddress: '192.168.1.128',
    status: 1,
    createdAt: new Date('2025-11-19'),
    updatedAt: new Date('2026-03-30'),
  },
  {
    id: 29,
    name: 'Device-029',
    ipAddress: '192.168.1.129',
    status: 2,
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-03-28'),
  },
  {
    id: 30,
    name: 'Device-030',
    ipAddress: '192.168.1.130',
    status: 3,
    createdAt: new Date('2025-12-12'),
    updatedAt: new Date('2026-03-23'),
  },
];