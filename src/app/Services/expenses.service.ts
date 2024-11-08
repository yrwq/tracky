import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private httpClient = inject(HttpClient)

  private fetch(url:string, errorMessage:string) {
    return this.httpClient.get(url)
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  private post(url:string, body:Object, errorMessage:string) {
    return this.httpClient.post(url, body)
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  getExpensesByMonth(month:string) {
    return this.fetch(
      "http://localhost:3000/expenses/month/" + month,
      "Error fetching expense"
    )
  }

  getMonthlySum(month:string) {
    return this.fetch(
      "http://localhost:3000/expenses/month/sum/" + month,
      "Error fetching expense"
    )
  }

  getExpenseById(id:number) {
    return this.fetch(
      "http://localhost:3000/expenses/id/" + id,
      "Error fetching expense"
    )
  }

  addNewExpense(formData:Object) {
    return this.post(
      "http://localhost:3000/expenses/new",
      formData,
      "Error while adding new user"
    )
  }

  editExpense(formData:Object) {
    return this.post(
      "http://localhost:3000/expenses/edit",
      formData,
      "Error while adding new user"
    )
  }

  deleteExpense(formData:Object) {
    return this.post(
      "http://localhost:3000/expenses/delete",
      formData,
      "Error while adding new user"
    )
  }
}
