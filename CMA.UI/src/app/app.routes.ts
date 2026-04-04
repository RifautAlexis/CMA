import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'configurator',
        loadChildren: () => import('./feature/configurator/configurator.routes').then(m => m.configuratorRoutes)
    },
];
