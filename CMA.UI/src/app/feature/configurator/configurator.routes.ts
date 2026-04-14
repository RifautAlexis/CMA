import { Routes } from '@angular/router';

export const configuratorRoutes: Routes = [
    {
        path: '',
        loadComponent() {
            return import('./configurator').then(m => m.ConfiguratorComponent);
        },
    },
];
