import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
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

  getSalaryByMonth(month:string) {
    return this.fetch(
      "http://localhost:3000/salary/get/" + month,
      "Error fetching salary"
    )
  }

  addSalary(formData:Object) {
    return this.post(
      "http://localhost:3000/salary/new",
      formData,
      "Error while adding new user"
    )
  }

  editSalary(formData:Object) {
    return this.post(
      "http://localhost:3000/salary/edit",
      formData,
      "Error while adding new user"
    )
  }
}
