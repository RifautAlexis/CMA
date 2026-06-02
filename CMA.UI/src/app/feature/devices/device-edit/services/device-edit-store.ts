import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StoreStatus } from '@shared/models/store-status';
import { Device } from '../../models/device';
import { DeviceEditHttp } from './device-edit-http';
import { EditDeviceRequest } from '../models/edit-device';
import { UpdateDeviceRequest } from '../../models/update-device';
import { StoreAction } from '@shared/models/store-action';
import { Router } from '@angular/router';

type DevicesState = {
  status: StoreStatus;
  data: Device[];
};

type DeviceEditCommand =
  | { action: StoreAction.Idle }
  | { action: StoreAction.Edit; payload: EditDeviceRequest }

const INITIAL_STATE: DevicesState = {
  status: StoreStatus.Loading,
  data: [],
};
const INITIAL_COMMAND: DeviceEditCommand = { action: StoreAction.Idle };

@Injectable()
export class DeviceEditStore {
  private readonly _deviceEditHttp = inject(DeviceEditHttp);
  private readonly _router = inject(Router);

  private readonly _state = signal<DevicesState>(INITIAL_STATE);
  private readonly _command = signal<DeviceEditCommand>(INITIAL_COMMAND);
  
  readonly status = computed(() => this._state().status);
  readonly devices = computed(() => this._state().data);
  readonly lastAction = computed(() => this._command().action);

  constructor() {
    effect(() => {
      const command = this._command();

      switch (command.action) {
        case StoreAction.Edit:
          this.executeEditDevice(command.payload);
          break;
        default:
          break;
      }
    });
  }

  dispatch(action: StoreAction.Idle): void;
  dispatch(action: StoreAction.Load, export const ACTION = createAction(
    '[NameSpace] ACTION',
    props<{payloadType}>()
  );): void;
  dispatch(action: StoreAction.Edit, payload: EditDeviceRequest): void;
  dispatch(action: StoreAction, payload?: EditDeviceRequest): void {
    switch (action) {
      case StoreAction.Edit:
        if (!payload) {
          return;
        }
        this._command.set({ action: StoreAction.Edit, payload: payload as EditDeviceRequest });
        return;
      case StoreAction.Idle:
      default:
        this._command.set({ action: StoreAction.Idle });
        return;
    }
  }

  private executeEditDevice(device: EditDeviceRequest): void {
    this._state.update((state) => ({
      ...state,
      status: StoreStatus.Loading,
    }));

    this._deviceEditHttp.createDevice(device).subscribe({
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
