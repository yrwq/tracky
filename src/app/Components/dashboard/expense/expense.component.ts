import { Component, DestroyRef, inject } from '@angular/core';
import { ExpensesService } from '../../../Services/expenses.service';
import { CategoryService } from '../../../Services/category.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss'
})
export class ExpenseComponent {
  expenses:any = null;

  expensesService = inject(ExpensesService);
  categoryService = inject(CategoryService);

  destroyRef = inject(DestroyRef);
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute);
}
