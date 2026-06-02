import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'devices',
        loadChildren: () => import('./feature/devices/device-list/device-list.routes').then(m => m.deviceListRoutes)
    },
    {
        path: 'devices/new',
        loadChildren: () => import('./feature/devices/device-create/device-create.routes').then(m => m.deviceCreateRoutes)
    },
    {
        path: 'devices/:id/edit',
        loadChildren: () => import('./feature/devices/device-edit/device-edit.routes').then(m => m.deviceEditRoutes)
    },
];
