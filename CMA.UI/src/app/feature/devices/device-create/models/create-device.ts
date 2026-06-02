export interface CreateDeviceRequest {
    name: string;
    ipAddress: string;
    snmpSettings?: {
        snmpPort: number;
        snmpVersion: number;
        mib2Branch: string;
        readCommunity: string;
        writeCommunity: string;
    };
}

export interface CreateDeviceResponse {
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}