import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Device } from '../models/device';
import { Observable } from 'rxjs';
import { CreateDeviceRequest, CreateDeviceResponse } from '../models/create-device';
import { UpdateDeviceRequest, UpdateDeviceResponse } from '../models/update-device';
import { BulkDeleteDeviceByIpRequest, BulkDeleteDevicesByIpResponse, DeleteDeviceByIpResponse } from '../models/delete-device';

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
        return this._httpClient.put<UpdateDeviceResponse>(`/devices/${id}`, deviceToUpdate);
    }

    deleteAllSelectedDevices(bulkDeleteDeviceByIpRequest: BulkDeleteDeviceByIpRequest): Observable<BulkDeleteDevicesByIpResponse> {
        return this._httpClient.delete<BulkDeleteDevicesByIpResponse>('/devices', { body: bulkDeleteDeviceByIpRequest });
    }

    deleteDeviceById(id: string): Observable<DeleteDeviceByIpResponse> {
        return this._httpClient.delete<DeleteDeviceByIpResponse>(`/devices/${id}`);
    }
}
