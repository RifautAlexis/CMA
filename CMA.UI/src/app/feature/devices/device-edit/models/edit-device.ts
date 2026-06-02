export interface EditDeviceRequest {
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

export interface EditDeviceResponse {
    name: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}