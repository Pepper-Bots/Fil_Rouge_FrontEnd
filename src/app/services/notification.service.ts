import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

// on veut pouvoir faire des notifications
  notification = inject(MatSnackBar)

  show(message: string, type : "valid" | "error" | "warning" | "info" = "info") {
    this.notification.open(
      message,
      "",
      {duration: 5000, verticalPosition: "top", panelClass:  type})

  }

}
