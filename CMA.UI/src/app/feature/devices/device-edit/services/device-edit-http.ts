import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EditDeviceRequest, EditDeviceResponse } from '../models/edit-device';

@Injectable()
export class DeviceEditHttp {
    private readonly _httpClient = inject(HttpClient);

    getDeviceToEdit(deviceId: string): Observable<EditDeviceResponse> {
        return this._httpClient.get<EditDeviceResponse>(`/devices/${deviceId}`);
    }

    createDevice(deviceToCreate: EditDeviceRequest): Observable<EditDeviceResponse> {
        return this._httpClient.patch<EditDeviceResponse>('/devices', deviceToCreate);
    }

    ValidateDeviceIpUniqueness(ipAddress: string): Observable<{ isUnique: boolean }> {
        return this._httpClient.get<{ isUnique: boolean }>(`/devices/ip-address/unique?ipAddress=${encodeURIComponent(ipAddress)}`);
    }
}
