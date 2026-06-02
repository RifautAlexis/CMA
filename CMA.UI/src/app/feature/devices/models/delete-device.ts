export interface DeleteDeviceByIdRequest {}

export interface DeleteDeviceByIdResponse {
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}

export interface BulkDeleteDeviceByIdsRequest {
    ids: string[];
}

export interface BulkDeleteDevicesByIdsResponse {
    deletedCount: number;
}