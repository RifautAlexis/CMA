import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StoreStatus } from '@shared/models/store-status';
import { Device } from '../../models/device';
import { DeviceCreateHttp } from './device-create-http';
import { CreateDeviceRequest } from '../models/create-device';
import { UpdateDeviceRequest } from '../../models/update-device';
import { StoreAction } from '@shared/models/store-action';
import { Router } from '@angular/router';

type DevicesState = {
  status: StoreStatus;
  data: Device[];
};

type DeviceCreateCommand =
  | { action: StoreAction.Idle }
  | { action: StoreAction.Create; payload: CreateDeviceRequest }

const INITIAL_STATE: DevicesState = {
  status: StoreStatus.Loading,
  data: [],
};
const INITIAL_COMMAND: DeviceCreateCommand = { action: StoreAction.Idle };

@Injectable()
export class DeviceCreateStore {
  private readonly _deviceCreateHttp = inject(DeviceCreateHttp);
  private readonly _router = inject(Router);

  private readonly _state = signal<DevicesState>(INITIAL_STATE);
  private readonly _command = signal<DeviceCreateCommand>(INITIAL_COMMAND);
  
  readonly status = computed(() => this._state().status);
  readonly devices = computed(() => this._state().data);
  readonly lastAction = computed(() => this._command().action);

  constructor() {
    effect(() => {
      const command = this._command();

      switch (command.action) {
        case StoreAction.Create:
          this.executeCreateDevice(command.payload);
          break;
        default:
          break;
      }
    });
  }

  dispatch(action: StoreAction.Idle): void;
  dispatch(action: StoreAction.Create, payload: CreateDeviceRequest): void;
  dispatch(action: StoreAction, payload?: CreateDeviceRequest): void {
    switch (action) {
      case StoreAction.Create:
        if (!payload) {
          return;
        }
        this._command.set({ action: StoreAction.Create, payload: payload as CreateDeviceRequest });
        return;
      case StoreAction.Idle:
      default:
        this._command.set({ action: StoreAction.Idle });
        return;
    }
  }

  private executeCreateDevice(device: CreateDeviceRequest): void {
    this._state.update((state) => ({
      ...state,
      status: StoreStatus.Loading,
    }));

    this._deviceCreateHttp.createDevice(device).subscribe({
      next: () => {
        this._state.update((state) => ({
          ...state,
          status: StoreStatus.Success,
        }));
        this.setIdleCommand();

        this._router.navigate(['/devices']);
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
}
