import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StoreStatus } from '@shared/models/store-status';
import { Device } from '../models/device';
import { ConfiguratorHttp } from './configurator-http';
import { CreateDeviceRequest } from '../models/create-device';
import { UpdateDeviceRequest } from '../models/update-device';
import { StoreAction } from '@shared/models/store-action';

type DevicesState = {
  status: StoreStatus;
  data: Device[];
};

type UpdateDevicePayload = UpdateDeviceRequest & { id: string };
type DeleteDevicePayload = { id: string };
type DeleteDevicesPayload = { ids: string[] };

type ConfiguratorCommand =
  | { action: StoreAction.Idle }
  | { action: StoreAction.Load }
  | { action: StoreAction.Create; payload: CreateDeviceRequest }
  | { action: StoreAction.Update; payload: UpdateDevicePayload }
  | { action: StoreAction.Delete; payload: DeleteDevicePayload }
  | { action: StoreAction.DeleteMultiple; payload: DeleteDevicesPayload };

const INITIAL_STATE: DevicesState = {
  status: StoreStatus.Loading,
  data: [],
};const INITIAL_COMMAND: ConfiguratorCommand = { action: StoreAction.Load };

@Injectable()
export class ConfiguratorStore {
  private readonly _configuratorHttp = inject(ConfiguratorHttp);

  private readonly _state = signal<DevicesState>(INITIAL_STATE);
  private readonly _command = signal<ConfiguratorCommand>(INITIAL_COMMAND);
  
  readonly status = computed(() => this._state().status);
  readonly devices = computed(() => this._state().data);
  readonly lastAction = computed(() => this._command().action);

  constructor() {
    effect(() => {
      const command = this._command();

      switch (command.action) {
        case StoreAction.Load:
          this.loadDevices();
          break;
        case StoreAction.Create:
          this.executeCreateDevice(command.payload);
          break;
        case StoreAction.Update:
          this.executeUpdateDevice(command.payload);
          break;
        case StoreAction.Delete:
          this.deleteDevice(command.payload);
          break;
        case StoreAction.DeleteMultiple:
          this.deleteDevices(command.payload);
          break;
        default:
          break;
      }
    });
  }

  dispatch(action: StoreAction.Idle): void;
  dispatch(action: StoreAction.Load): void;
  dispatch(action: StoreAction.Create, payload: CreateDeviceRequest): void;
  dispatch(action: StoreAction.Update, payload: UpdateDeviceRequest & { id: string }): void;
  dispatch(action: StoreAction.Delete, payload: { id: string }): void;
  dispatch(action: StoreAction.DeleteMultiple, payload: { ids: string[] }): void;
  dispatch(action: StoreAction, payload?: CreateDeviceRequest | UpdateDevicePayload | DeleteDevicePayload | DeleteDevicesPayload): void {
    switch (action) {
      case StoreAction.Load:
        this._command.set({ action: StoreAction.Load });
        return;
      case StoreAction.Create:
        if (!payload) {
          return;
        }
        this._command.set({ action: StoreAction.Create, payload: payload as CreateDeviceRequest });
        return;
      case StoreAction.Update:
        if (!payload) {
          return;
        }
        this._command.set({ action: StoreAction.Update, payload: payload as UpdateDevicePayload });
        return;
      case StoreAction.Delete:
        this._command.set({ action: StoreAction.Delete, payload: payload as DeleteDevicePayload });
        return;
      case StoreAction.DeleteMultiple:
        this._command.set({ action: StoreAction.DeleteMultiple, payload: payload as DeleteDevicesPayload });
        return;
      case StoreAction.Idle:
      default:
        this._command.set({ action: StoreAction.Idle });
        return;
    }
  }

  private loadDevices(): void {
    this._state.update((state) => ({
      ...state,
      status: StoreStatus.Loading,
      data: [],
    }));

    this._configuratorHttp.getAllDevices().subscribe({
      next: (devices) => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Success,
          data: devices,
        }));
        this.setIdleCommand();
      },
      error: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Error,
          data: [],
        }));
        this.setIdleCommand();
      },
    });
  }

  private executeCreateDevice(device: CreateDeviceRequest): void {
    this._state.update((state) => ({
      ...state,
      status: StoreStatus.Loading,
    }));

    this._configuratorHttp.createDevice(device).subscribe({
      next: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Success,
        }));
        this.setLoadCommand();
      },
      error: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Error,
        }));
        this.setIdleCommand();
      },
    });
  }

  private executeUpdateDevice(device: UpdateDeviceRequest & { id: string }): void {
    this._state.update((state) => ({
      ...state,
      status: StoreStatus.Loading,
    }));
    
    const deviceToEdit: UpdateDeviceRequest = {
      name: device.name,
      ipAddress: device.ipAddress,
    };

    this._configuratorHttp.updateDevice(device.id, deviceToEdit).subscribe({
      next: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Success,
        }));
        this.setLoadCommand();
      },
      error: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Error,
        }));
        this.setIdleCommand();
      },
    });
  }

  private deleteDevice(payload: DeleteDevicePayload): void {
    this._configuratorHttp.deleteDeviceById(payload.id).subscribe({
      next: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Success,
        }));
        this.setLoadCommand();
      },
      error: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Error,
        }));
        this.setIdleCommand();
      },
    });
  }

  private deleteDevices(payload: DeleteDevicesPayload): void {
    this._configuratorHttp.deleteAllSelectedDevices({ ids: payload.ids }).subscribe({
      next: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Success,
        }));
        this.setLoadCommand();
      },
      error: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Error,
        }));
        this.setIdleCommand();
      },
    });
  }

  private setIdleCommand(): void {
    this._command.set({ action: StoreAction.Idle });
  }
  private setLoadCommand(): void {
    this._command.set({ action: StoreAction.Load });
  }
}
