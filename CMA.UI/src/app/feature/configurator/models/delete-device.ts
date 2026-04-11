export interface DeleteDeviceByIpRequest {}

export interface DeleteDeviceByIpResponse {
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}

export interface BulkDeleteDeviceByIpRequest {
    ipAddress: string;
}

export interface BulkDeleteDevicesByIpResponse {
    deletedCount: number;
}