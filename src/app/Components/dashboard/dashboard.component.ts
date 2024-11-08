import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ModalModule } from '@coreui/angular';
import { ExpensesService } from '../../Services/expenses.service';
import { DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../Services/category.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ModalModule, DecimalPipe, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  months: string[] = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November"]

  formatMonth(month: string): string {
    const monthMap: { [key: string]: string } = {
      'januar': 'Január',
      'februar': 'Február',
      'marcius': 'Március',
      'aprilis': 'Április',
      'majus': 'Május',
      'junius': 'Június',
      'julius': 'Július',
      'augusztus': 'Augusztus',
      'szeptember': 'Szeptember',
      'oktober': 'Október',
      'november': 'November',
      'december': 'December'
    };
    return monthMap[month] || "undefined";
  }

  removeEkezet(input: string): string {
    const ekezetek: { [key: string]: string } = {
        á: 'a', é: 'e', í: 'i', ó: 'o', ö: 'o', ő: 'o', ú: 'u', ü: 'u', ű: 'u',
        Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ö: 'O', Ő: 'O', Ú: 'U', Ü: 'U', Ű: 'U'
    };

    return input.split('').map(char => ekezetek[char] || char).join('');
  }

  toLower(month: string) {
    return(this.removeEkezet(month.toLocaleLowerCase()))
  }
  // API
  
  expensesService = inject(ExpensesService);
  categoryService = inject(CategoryService);

  destroyRef = inject(DestroyRef);
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute);
  
  month:string = "";
  categories:any = null;
  expenses:any = null;
  expenseSum:any = null;
  
  loadExpenses() {
    const subscription = this.expensesService.getExpensesByMonth(this.month).subscribe({
      next: (res) => {
        this.expenses=res
      }
    })

    const calculateSum = this.expensesService.getMonthlySum(this.month).subscribe({
      next: (res) => {
        this.expenseSum = res
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
      calculateSum.unsubscribe()
    })
  }

  ngOnInit(): void {
    const subscription = this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories=res
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })

    this.activatedRoute.paramMap.subscribe(params => {
      this.month=params.get("month") || '';
      this.loadExpenses()
    })
  }

  // ADD FORM

  openAddDialog() {
    const dialog = document.getElementById("addExpenseDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideAddDialog() {
    const dialog = document.getElementById("addExpenseDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
  }


  addExpenseForm = new FormGroup ({
    category: new FormControl(''),
    amount: new FormControl(''),
    description: new FormControl('')
  })

  onSubmit() {
    console.log(this.addExpenseForm.value.category)
    const subscription = this.expensesService.addNewExpense(
      {
        month: this.month,
        category: this.addExpenseForm.value.category,
        amount: this.addExpenseForm.value.amount,
        description: this.addExpenseForm.value.description,
      }
    ).subscribe({
      next: (res) => {
        this.addExpenseForm.reset()
        this.loadExpenses()
        this.hideAddDialog()
      }
    })
    
    this.destroyRef.onDestroy( () => subscription.unsubscribe() )
  }

  // EDIT FORM
  
  editExpenseForm = new FormGroup ({
    id: new FormControl(0),
    category: new FormControl(''),
    amount: new FormControl(''),
    description: new FormControl('')
  })
  
  openEditDialog(expenseId:number) {
    const dialog = document.getElementById("editExpenseDialog") as HTMLElement
    let currentExpense:any;

    const subscription = this.expensesService.getExpenseById(expenseId).subscribe({
      next: (res) => {
        currentExpense=res

        this.editExpenseForm.patchValue({
          id: expenseId,
          category: currentExpense.category,
          amount: currentExpense.amount,
          description: currentExpense.description,
        })
      }
    })
    
    this.destroyRef.onDestroy(() => subscription.unsubscribe() )
    dialog.style.visibility = "unset"
  }


  editExpense() {
    const subscription = this.expensesService.editExpense({
      id: this.editExpenseForm.value.id,
      category: this.editExpenseForm.value.category,
      amount: this.editExpenseForm.value.amount,
      description: this.editExpenseForm.value.description,
    }).subscribe({
      next: (res) => {
        this.editExpenseForm.reset()
        this.loadExpenses()
        this.hideEditDialog()
      }
    })
    
    this.destroyRef.onDestroy(() => subscription.unsubscribe() )
  }

  deleteExpense() {
    const subscription = this.expensesService.deleteExpense({
      id: this.editExpenseForm.value.id
    }).subscribe({
      next: (res) => {
        this.loadExpenses()
        this.hideEditDialog()
      }
    })
  }

  hideEditDialog() {
    const dialog = document.getElementById("editExpenseDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
  }
}
