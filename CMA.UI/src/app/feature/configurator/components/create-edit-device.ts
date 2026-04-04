import { HlmFieldImports } from './../../../../../libs/ui/field/src/index';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { BrnSheet } from '@spartan-ng/brain/sheet';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { Device } from '../models/device';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ipAddressValidator } from '../validators/ip-address.validator';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-create-edit-device',
  imports: [HlmSheetImports, HlmInputImports, HlmFieldImports, ReactiveFormsModule, HlmButtonImports],
  template: `
    <hlm-sheet side="right">
      <hlm-sheet-content *hlmSheetPortal="let ctx">
        <hlm-sheet-header>
          <h1 hlmSheetTitle>{{ deviceToEdit() ? 'Edit Device' : 'Create Device' }}</h1>
          <p hlmSheetDescription>
            {{ cardDescription() }}
          </p>
        </hlm-sheet-header>
        <form
          id="form-create-edit-device"
          class="grid flex-1 auto-rows-min gap-6 px-4"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          <hlm-field-group>
            <hlm-field>
              <label hlmFieldLabel for="name">Name</label>
              <input
                hlmInput
                id="name"
                placeholder="Enter device name"
                autoComplete="off"
                formControlName="name"
              />
              <hlm-field-error validator="required">Name must be entered.</hlm-field-error>
              <hlm-field-error validator="minlength"
                >Name must be at least {{NAME_MIN_LENGTH}} characters.</hlm-field-error
              >
              <hlm-field-error validator="maxlength"
                >Name cannot exceed {{NAME_MAX_LENGTH}} characters.</hlm-field-error
              >
            </hlm-field>
            <hlm-field>
              <label hlmFieldLabel for="ipAddress">IP Address</label>
              <input
                hlmInput
                id="ipAddress"
                placeholder="Enter device IP address"
                autoComplete="off"
                formControlName="ipAddress"
              />
              <hlm-field-error validator="required">IP Address must be entered.</hlm-field-error>
              <hlm-field-error validator="ipAddress">
                IP Address must be in a valid format.
              </hlm-field-error
              >
            </hlm-field>
          </hlm-field-group>
        </form>
        <hlm-sheet-footer>
          <hlm-field orientation="horizontal">
            <button hlmBtn type="submit" form="form-create-edit-device" [disabled]="form.invalid">Submit</button>
            <button hlmSheetClose hlmBtn variant="outline">Close</button>
          </hlm-field>
        </hlm-sheet-footer>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
})
export class CreateEditDeviceComponent {
  private readonly _fb = inject(FormBuilder);

  protected readonly NAME_MIN_LENGTH = 5;
  protected readonly NAME_MAX_LENGTH = 32;

  protected cardDescription = computed(() =>
    this.deviceToEdit() ? `Make changes to your device here. Click save when you're done.` : 'Fill out the form to create a new device.'
    );

  public readonly deviceToEdit = signal<Device | undefined>(undefined);
  public form = this._fb.group({
    name: ['', [Validators.required, Validators.minLength(this.NAME_MIN_LENGTH), Validators.maxLength(this.NAME_MAX_LENGTH)]],
    ipAddress: ['', [Validators.required, ipAddressValidator()]],
  });

  private readonly _sheet = viewChild(BrnSheet);

  constructor() {
    effect(() => {
      if (this.deviceToEdit()) {
        this.form.patchValue({
          name: this.deviceToEdit()?.name,
          ipAddress: this.deviceToEdit()?.ipAddress,
        });
      } else {
        this.form.reset();
      }
    });
  }

  open(device?: Device): void {
    this.deviceToEdit.set(device);
    this._sheet()?.open();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
