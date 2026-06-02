import { Routes } from '@angular/router';

export const deviceListRoutes: Routes = [
    {
        path: '',
        loadComponent() {
            return import('./device-list').then(m => m.deviceListComponent);
        },
    },
];
