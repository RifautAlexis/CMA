import { Component, computed, input } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { DeviceStatus } from '../models/device';
import { DeviceStatusPipe } from '../pipes/device-status.pipe';

@Component({
  selector: 'app-status-device-badge',
  imports: [HlmBadgeImports, DeviceStatusPipe],
  template: `
    <span hlmBadge [class]="badgeClass()">{{
      status() | deviceStatus
    }}</span>
  `,
})
export class StatusDeviceBadge {
  readonly status = input.required<DeviceStatus>();

  private readonly _badgeClasses: Record<DeviceStatus, string> = {
    [DeviceStatus.Online]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    [DeviceStatus.Offline]: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    [DeviceStatus.Maintenance]: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    [DeviceStatus.Unknown]: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  };

  readonly badgeClass = computed(() => this._badgeClasses[this.status()]);
}
