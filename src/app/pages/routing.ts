import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'calendar',
    loadChildren: () => import('./calendar/calendar.module').then((m) => m.CalendarModule),
  },
  {
    path: 'catalogs',
    loadChildren: () => import('./catalogs/catalogs.module').then((m) => m.CatalogsModule),
  },
  {
    path: 'params',
    loadChildren: () => import('./parametros/parametros.module').then((m)=> m.ParametrosModule) 
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
