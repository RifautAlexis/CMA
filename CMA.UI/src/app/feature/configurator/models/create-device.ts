export interface CreateDeviceRequest {
    name: string;
    ipAddress: string;
}

export interface CreateDeviceResponse {
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}