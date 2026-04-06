export interface Device {
    id: number;
    name: string;
    ipAddress: string;
    status: DeviceStatus;
    createdAt: Date;
    updatedAt: Date;
}

export enum DeviceStatus {
    Online,
    Offline,
    Maintenance,
    Unknown,
}