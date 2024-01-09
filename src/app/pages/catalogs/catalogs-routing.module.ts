import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogsComponent } from './catalogs.component';
import { RoomsComponent } from './rooms/rooms.component';



// import { TarifarioComponent } from '../tarifas/tarifario/tarifario.component';

const routes: Routes = [
  {
    path: '',
    component: CatalogsComponent,
    children: [
      {
        path: 'rooms',
        component: RoomsComponent,
      },
      { path: '', redirectTo: 'rooms', pathMatch: 'full' },
      { path: '**', redirectTo: 'rooms', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogsRoutingModule {}
