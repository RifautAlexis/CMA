import { Store } from '@shared/models/store';
import { computed, inject, Injectable, signal } from '@angular/core';
import { StoreStatus } from '@shared/models/store-status';
import { Device } from '../models/device';
import { ConfiguratorHttp } from './configurator-http';

const INITIAL_STATE: Store<Device[]> = {
  status: StoreStatus.Loading,
  data: [],
};

@Injectable()
export class ConfiguratorStore {
  private readonly _configuratorHttp = inject(ConfiguratorHttp);
  private readonly _state = signal<Store<Device[]>>(INITIAL_STATE);

  readonly status = computed(() => this._state().status);
  readonly devices = computed(() => this._state().data);

  constructor() {
    this.loadDevices();
  }

  private async loadDevices(): Promise<void> {
    this._state.set({
      status: StoreStatus.Loading,
      data: [],
    });
    
    this._configuratorHttp.getAllDevices().subscribe({
      next: (devices) => {
        this._state.update((state) => ({
          status: StoreStatus.Success,
          data: devices,
        }));
      },
      error: (error) => {
        this._state.update((state) => ({
          status: StoreStatus.Error,
          data: [],
        }));
      },
    });
  }
}
