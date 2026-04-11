export interface UpdateDeviceRequest {
    name: string;
    ipAddress: string;
}

export interface UpdateDeviceResponse {
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}