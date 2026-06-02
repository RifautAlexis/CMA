import { HlmTabsImports } from '../../../../../libs/ui/tabs/src/index';
import { HlmCardImports } from '../../../../../libs/ui/card/src/index';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  required,
  minLength,
  maxLength,
  min,
  max,
  validate,
  validateHttp,
  disabled,
  debounce,
} from '@angular/forms/signals';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { DeviceEditStore } from './services/device-edit-store';
import { DeviceEditHttp } from './services/device-edit-http';
import { StoreStatus } from '@shared/models/store-status';
import { EditDeviceRequest } from './models/edit-device';
import { StoreAction } from '@shared/models/store-action';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { ipAddressFormatValidator } from '../device-list/validators/ip-address-format.validator';
import { Router, RouterLink } from '@angular/router';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';

interface DeviceEditForm {
  generalInformation: {
    name: string;
    ipAddress: string;
    isSnmpEnabled: boolean;
  };
  snmpSetting: {
    snmpPort: number;
    snmpVersion: number;
    mib2Branch: string;
    readCommunity: string;
    writeCommunity: string;
  };
}

@Component({
  templateUrl: './device-edit.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    HlmCardImports,
    HlmIconImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    RouterLink,
    HlmTabsImports,
    HlmSelectImports,
    FormField,
    HlmCheckboxImports,
  ],
  providers: [DeviceEditHttp, DeviceEditStore, provideIcons({})],
  host: {
    class: 'w-full',
  },
})
export class DeviceEditComponent {
  private readonly _deviceEditStore = inject(DeviceEditStore);
  private readonly _router = inject(Router);

  protected readonly NAME_MIN_LENGTH = 3;
  protected readonly NAME_MAX_LENGTH = 32;
  protected readonly SNMP_PORT_MIN = 0;
  protected readonly SNMP_PORT_MAX = 255;

  protected readonly _storeStatus = StoreStatus;
  protected readonly _status = this._deviceEditStore.status;

  // when no options for communicationProtocol is selected => disabled SNMP Settings tabs and formcontrol related
  protected deviceEditModel = signal<DeviceEditForm>({
    generalInformation: {
      name: '',
      ipAddress: '',
      isSnmpEnabled: false,
    },
    snmpSetting: {
      snmpPort: 161,
      snmpVersion: 2,
      mib2Branch: '.1.3.6.1.2.1',
      readCommunity: 'public',
      writeCommunity: 'private',
    },
  });
  deviceEditForm = form(this.deviceEditModel, (schemaPath) => {
    // Name
    required(schemaPath.generalInformation.name, { message: 'Device Name is required' });
    minLength(schemaPath.generalInformation.name, this.NAME_MIN_LENGTH, {
      message: `Device Name must be between ${this.NAME_MIN_LENGTH} and ${this.NAME_MAX_LENGTH} characters`,
    });
    maxLength(schemaPath.generalInformation.name, this.NAME_MAX_LENGTH, {
      message: `Device Name must be between ${this.NAME_MIN_LENGTH} and ${this.NAME_MAX_LENGTH} characters`,
    });

    // IP Address
    required(schemaPath.generalInformation.ipAddress, { message: 'IP Address is required' });
    ipAddressFormatValidator(schemaPath.generalInformation.ipAddress);
    debounce(schemaPath.generalInformation.ipAddress, 1000);
    validateHttp(schemaPath.generalInformation.ipAddress, {
      request: ({ value }) => `/devices/ip-address/unique?ipAddress=${encodeURIComponent(value())}`,
      onSuccess: (isUnique: boolean) =>
        isUnique ? null : { kind: 'ipAddressNotUnique', message: 'IP Address is already taken' },
      onError: () => ({
        kind: 'networkError',
        message: 'Could not verify IP Address uniqueness due to a network error. Please try again.',
      }),
    });

    // Communication Protocol

    // SNMP Settings - only validate if SNMP is selected as communication protocol
    disabled(
      schemaPath.snmpSetting,
      ({ valueOf }) => !valueOf(schemaPath.generalInformation.isSnmpEnabled),
    );

    // SNMP Port
    required(schemaPath.snmpSetting!.snmpPort, { message: 'SNMP Port is required' });
    min(schemaPath.snmpSetting!.snmpPort, this.SNMP_PORT_MIN, {
      message: `SNMP Port must be between ${this.SNMP_PORT_MIN} and ${this.SNMP_PORT_MAX}`,
    });
    max(schemaPath.snmpSetting!.snmpPort, this.SNMP_PORT_MAX, {
      message: `SNMP Port must be between ${this.SNMP_PORT_MIN} and ${this.SNMP_PORT_MAX}`,
    });

    // SNMP Version
    required(schemaPath.snmpSetting!.snmpVersion, { message: 'SNMP Version is required' });
    validate(schemaPath.snmpSetting!.snmpVersion, ({ value }) =>
      [1, 2, 3].includes(value())
        ? null
        : { kind: 'invalidSnmpVersion', message: 'SNMP Version must be 1, 2, or 3' },
    );

    // MIB2 Branch
    required(schemaPath.snmpSetting!.mib2Branch, { message: 'MIB2 Branch is required' });
    validate(schemaPath.snmpSetting!.mib2Branch, ({ value }) =>
      /^\.\d+(\.\d+)*$/.test(value())
        ? null
        : { kind: 'invalidMib2Branch', message: 'MIB2 Branch must be in the format .1.3.6.1.2.1' },
    );

    // Read Community
    required(schemaPath.snmpSetting!.readCommunity, { message: 'Read Community is required' });
    minLength(schemaPath.snmpSetting!.readCommunity, 1, {
      message: 'Read Community must be at least 1 character',
    });
    maxLength(schemaPath.snmpSetting!.readCommunity, 64, {
      message: 'Read Community must be at most 64 characters',
    });

    // Write Community
    required(schemaPath.snmpSetting!.writeCommunity, { message: 'Write Community is required' });
    minLength(schemaPath.snmpSetting!.writeCommunity, 1, {
      message: 'Write Community must be at least 1 character',
    });
    maxLength(schemaPath.snmpSetting!.writeCommunity, 64, {
      message: 'Write Community must be at most 64 characters',
    });
  });

  protected readonly snmpVersionOptions: { value: number; label: string }[] = [
    { value: 1, label: 'SNMP v1' },
    { value: 2, label: 'SNMP v2c' },
    { value: 3, label: 'SNMP v3' },
  ];

  public readonly numberToString = (value: number) =>
    this.snmpVersionOptions.find((d) => d.value === value)?.label ?? '';

  submit() {
    if (this.deviceEditForm().invalid()) {
      return;
    }

    const deviceToEdit: EditDeviceRequest = {
      name: this.deviceEditForm.generalInformation.name().value(),
      ipAddress: this.deviceEditForm.generalInformation.ipAddress().value(),
      snmpSettings: this.deviceEditForm.generalInformation.isSnmpEnabled().value()
        ? {
            snmpPort: this.deviceEditForm.snmpSetting!.snmpPort().value(),
            snmpVersion: this.deviceEditForm.snmpSetting!.snmpVersion().value(),
            mib2Branch: this.deviceEditForm.snmpSetting!.mib2Branch().value(),
            readCommunity: this.deviceEditForm.snmpSetting!.readCommunity().value(),
            writeCommunity: this.deviceEditForm.snmpSetting!.writeCommunity().value(),
          }
        : undefined,
    };

    this._deviceEditStore.dispatch(StoreAction.Edit, deviceToEdit);
  }
}
