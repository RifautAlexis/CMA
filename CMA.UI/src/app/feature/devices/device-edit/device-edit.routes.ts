import { Routes } from '@angular/router';

export const deviceEditRoutes: Routes = [
    {
        path: '',
        loadComponent() {
            return import('./device-edit').then(m => m.DeviceEditComponent);
        },
    },
];
