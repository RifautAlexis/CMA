import { StoreAction } from "./store-action";
import { StoreStatus } from "./store-status";

export interface Store<T> {
    status: StoreStatus;
    action: StoreAction;
    data: T;
}