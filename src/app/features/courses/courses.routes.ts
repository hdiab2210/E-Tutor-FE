import { Routes } from '@angular/router';
import { CoursesListComponent } from './pages/courses-list/courses-list.component';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    component: CoursesListComponent
  }
];