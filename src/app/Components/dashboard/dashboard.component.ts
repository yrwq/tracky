import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ModalModule } from '@coreui/angular';
import { ExpensesService } from '../../Services/expenses.service';
import { DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../Services/category.service';
import { SalaryService } from '../../Services/salary.service';


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
  salaryService = inject(SalaryService);

  destroyRef = inject(DestroyRef);
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute);
  
  month:string = "";
  categories:any = null;
  expenses:any = null;
  expenseSum:any = null;
  salary:any = 0;
  savings:any = 0;
  
  loadExpenses() {
    const subscription = this.expensesService.getExpensesByMonth(this.month).subscribe({
      next: (res) => {
        this.expenses=res
      }
    })

    const calculateSum = this.expensesService.getMonthlySum(this.month).subscribe({
      next: (res) => {
        this.expenseSum = res
        
        if(this.expenseSum !== null && this.expenses !== null && this.salary !== null) {
          this.calculateSavings()
        }
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
      this.getSalary(this.month)
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

  onAddExpense() {
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

  hideEditDialog() {
    const dialog = document.getElementById("editExpenseDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
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

  // SALARY FORM
  openSalaryAddDialog() {
    const dialog = document.getElementById("editSalaryDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideSalaryDialog() {
    const dialog = document.getElementById("editSalaryDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
  }

  editSalaryForm = new FormGroup ({
    amount: new FormControl(0),
    month: new FormControl("")
  })

  getSalary(month:string) {
    const subscription = this.salaryService.getSalaryByMonth(month).subscribe({
      next: (res) => {
        this.salary=res
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe() )
  }

  onAddSalary() {
    const subscription = this.salaryService.addSalary(
      {
        amount: this.editSalaryForm.value.amount,
        month: this.month,
      }
    ).subscribe({
      next: (res) => {
        this.editSalaryForm.reset()
        this.getSalary(this.month)
        this.loadExpenses()
        this.hideSalaryDialog()
      }
    })
  }

  openSalaryEditDialog() {
    const dialog = document.getElementById("editSalaryDialog") as HTMLElement
    let currentSalary:any;

    const subscription = this.salaryService.getSalaryByMonth(this.month).subscribe({
      next: (res) => {
        currentSalary=res

        this.editSalaryForm.patchValue({
          amount: currentSalary.amount,
          month: this.month,
        })
      }
    })
    
    this.destroyRef.onDestroy(() => subscription.unsubscribe() )
    dialog.style.visibility = "unset"
  }
  
  onEditSalary() {
    const subscription = this.salaryService.editSalary({
      amount: this.editSalaryForm.value.amount,
      month: this.month
    }).subscribe({
      next: (res) => {
        this.editSalaryForm.reset()
        this.loadExpenses()
        this.hideEditDialog()
      }
    })
    
    this.destroyRef.onDestroy(() => subscription.unsubscribe() )
  }

  // MEGTAKARÍTÁS KALKULÁCIÓ

  calculateSavings() {
    if(parseInt(this.salary.amount) && parseInt(this.expenseSum.sum)) {
      this.savings = parseInt(this.salary.amount)-parseInt(this.expenseSum.sum)
    } else {
      return
    }
  }
}
