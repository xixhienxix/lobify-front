import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogsComponent } from './catalogs.component';
import { RoomsComponent } from './rooms/rooms.component';
import { RatesComponent } from './rates/rates.component';
import { PromoComponent } from './promos/promo.component';



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
      {
        path: 'rates',
        component: RatesComponent,
      },
      {
        path: 'promos',
        component: PromoComponent,
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
