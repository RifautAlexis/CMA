import { Routes } from '@angular/router';

export const deviceCreateRoutes: Routes = [
    {
        path: '',
        loadComponent() {
            return import('./device-create').then(m => m.DeviceCreateComponent);
        },
    },
];
