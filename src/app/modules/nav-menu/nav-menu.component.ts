import { Component } from '@angular/core';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button"
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { PlayAgainstComputerDialogComponent } from '../play-against-computer-dialog/play-against-computer-dialog.component';
import { UserService } from '../../services/user.service';
import { AsyncPipe, NgIf } from '@angular/common';   // 👈 add these
import { LoginComponent } from '../dialogs/login/login.component';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterModule, MatDialogModule,
    AsyncPipe, 
    NgIf  ]       
})
export class NavMenuComponent {
  isLoggedIn = false;
  username: string = 'logged out';
  constructor(private dialog: MatDialog, public userService: UserService,private router: Router) {
    let user = userService.getUser();
    userService.user$.subscribe((u) =>{
       this.username = u?.username  ?? 'logged out';
       this.isLoggedIn = !(u == undefined || u == null);
    });
    if(user){
      console.log("logged in!")
      this.isLoggedIn = true;
      this.username = user.username ?? 'logged out';
    }else{
      this.isLoggedIn = false;
    }
  }

  getUser(){
    let user = this.userService.getUser();
    if(user){
      this.username = user.username ?? '';
      this.isLoggedIn = true;
    }
    return user != null;
  }
  public playAgainstComputer(): void {
    this.dialog.open(PlayAgainstComputerDialogComponent);
  }

  openLogin(){
    this.dialog.open(LoginComponent);
  }

  logOut(){
    this.userService.logout();
    this.router.navigate(['']);
  }
}
