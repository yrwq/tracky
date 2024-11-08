import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ExpensesService } from '../../Services/expenses.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../Services/category.service';
import { CategoriesComponent } from "./categories/categories.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule, CategoriesComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  
}
