import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LandingComponent } from './Components/landing/landing.component';

export const routes: Routes = [
    { path: '', component: LandingComponent},
    { path: 'dashboard', component: LandingComponent },
    { path: 'dashboard/:month', component: DashboardComponent },

    { path: "**", component: LandingComponent}
];
