import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { UserListComponent } from './users/user.list.component';
import { UserEditComponent } from './users/user.edit.component';
import { SharedModule } from './shared.module';
import { GeneratedRoutes } from './generated.routes';

@NgModule({
   declarations: [UserListComponent, UserEditComponent],
   imports: [
      CommonModule,
      FormsModule,
      RouterModule.forChild(GeneratedRoutes),
      NgbModule,
      DragDropModule,
      SharedModule
   ]
})
export class GeneratedModule { }
