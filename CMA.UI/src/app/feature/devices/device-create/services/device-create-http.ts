import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDeviceRequest, CreateDeviceResponse } from '../models/create-device';

@Injectable()
export class DeviceCreateHttp {
    private readonly _httpClient = inject(HttpClient);

    createDevice(deviceToCreate: CreateDeviceRequest): Observable<CreateDeviceResponse> {
        return this._httpClient.post<CreateDeviceResponse>('/devices', deviceToCreate);
    }

    ValidateDeviceIpUniqueness(ipAddress: string): Observable<{ isUnique: boolean }> {
        return this._httpClient.get<{ isUnique: boolean }>(`/devices/ip-address/unique?ipAddress=${encodeURIComponent(ipAddress)}`);
    }
}
