import { Routes } from '@angular/router';

export const configuratorRoutes: Routes = [
    {
        path: '',
        loadComponent() {
            return import('./configurator.component').then(m => m.ConfiguratorComponent);
        },
    },
];
