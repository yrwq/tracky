import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent},
    { path: 'dashboard/:month', component: DashboardComponent },

    { path: "**", component: DashboardComponent}
];
