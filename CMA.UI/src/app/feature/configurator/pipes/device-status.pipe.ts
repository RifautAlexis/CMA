import { Pipe, PipeTransform } from '@angular/core';
import { DeviceStatus } from '../models/device';

@Pipe({
	name: 'deviceStatus',
})
export class DeviceStatusPipe implements PipeTransform {
	transform(value: DeviceStatus): string {

        switch (value) {
            case DeviceStatus.Online:
                return 'Online';
            case DeviceStatus.Offline:
                return 'Offline';
            case DeviceStatus.Maintenance:
                return 'Maintenance';
            case DeviceStatus.Unknown:
            default:
                return 'Unknown';
        }
	}
}
