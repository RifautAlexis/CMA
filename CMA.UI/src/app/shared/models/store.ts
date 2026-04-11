import { StoreStatus } from "./store-status";

export interface Store<T> {
    status: StoreStatus;
    data: T;
}