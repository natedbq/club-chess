import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  constructor(private userService: UserService, private authService: AuthService){
  }

  login(){
    this.authService.authenticate(this.username, this.password).subscribe((jwt) => {
        this.userService.loadMe().subscribe();
    });
  }
  cancel(){
    this.username = '';
    this.password = '';
  }
}
