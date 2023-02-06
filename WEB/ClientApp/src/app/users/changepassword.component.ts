import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { ErrorService } from '../common/services/error.service';
import { ChangePasswordModel } from '../common/models/auth.models';
import { AuthService } from '../common/services/auth.service';

@Component({
   selector: 'changepassword',
   templateUrl: './changepassword.component.html'
})
export class ChangePasswordComponent implements OnInit {

   changePassword: ChangePasswordModel = new ChangePasswordModel();

   constructor(
      private router: Router,
      public route: ActivatedRoute,
      private toastr: ToastrService,
      private errorService: ErrorService,
      private authService: AuthService,
   ) {
   }

   ngOnInit(): void {

   }

   save(form: NgForm): void {

      if (form.invalid) {

         this.toastr.error("The form has not been completed correctly.", "Form Error");
         return;

      }

      if (this.changePassword.newPassword !== this.changePassword.confirmPassword) {

         this.toastr.error("The new and confirm passwords are different.", "Form Error");
         return;

      }

      this.authService.changePassword(this.changePassword)
         .subscribe(
            () => {
               this.toastr.success("Your password has been changed", "Change Password");
               form.resetForm();
               this.changePassword = new ChangePasswordModel();
            },
            err => {
               this.errorService.handleError(err, "Password", "Change");
            }
         );

   }

}
