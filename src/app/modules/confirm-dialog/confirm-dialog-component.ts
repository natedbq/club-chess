import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {  MAT_DIALOG_DATA  } from "@angular/material/dialog";

@Component({
  selector: 'app-my-dialog',
  templateUrl: './confirm-dialog-component.html',
      standalone: true,
      imports: [MatDialogModule, MatButtonModule, CommonModule, FormsModule]
})
export class ConfirmDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmDialogComponent>, private dialog: MatDialog) {}

  onYesClick(): void {
    this.dialogRef.close(true); // Return true for "Yes"
  }

  onNoClick(): void {
    this.dialogRef.close(false); // Return false for "No"
  }
}