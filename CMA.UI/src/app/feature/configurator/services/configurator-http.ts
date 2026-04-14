import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Device } from '../models/device';
import { Observable } from 'rxjs';
import { CreateDeviceRequest, CreateDeviceResponse } from '../models/create-device';
import { UpdateDeviceRequest, UpdateDeviceResponse } from '../models/update-device';
import { BulkDeleteDeviceByIdsRequest, BulkDeleteDevicesByIdsResponse, DeleteDeviceByIdResponse,  } from '../models/delete-device';

@Injectable()
export class ConfiguratorHttp {
    private readonly _httpClient = inject(HttpClient);

    getAllDevices(): Observable<Device[]> {
        return this._httpClient.get<Device[]>('/devices');
    }

    createDevice(deviceToCreate: CreateDeviceRequest): Observable<CreateDeviceResponse> {
        return this._httpClient.post<CreateDeviceResponse>('/devices', deviceToCreate);
    }

    updateDevice(id: string, deviceToUpdate: UpdateDeviceRequest): Observable<UpdateDeviceResponse> {
        return this._httpClient.patch<UpdateDeviceResponse>(`/devices/${id}`, deviceToUpdate);
    }

    deleteAllSelectedDevices(bulkDeleteDeviceByIpRequest: BulkDeleteDeviceByIdsRequest): Observable<BulkDeleteDevicesByIdsResponse> {
        return this._httpClient.delete<BulkDeleteDevicesByIdsResponse>('/devices', { body: bulkDeleteDeviceByIpRequest });
    }

    deleteDeviceById(id: string): Observable<DeleteDeviceByIdResponse> {
        return this._httpClient.delete<DeleteDeviceByIdResponse>(`/devices/${id}`);
    }

    ValidateDeviceIpUniqueness(ipAddress: string): Observable<{ isUnique: boolean }> {
        return this._httpClient.get<{ isUnique: boolean }>(`/devices/ip-address/unique?ipAddress=${encodeURIComponent(ipAddress)}`);
    }
}
