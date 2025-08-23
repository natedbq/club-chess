import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  constructor(private userService: UserService){
  }

  login(){
    this.userService.login(this.username, this.password).subscribe((user) => {
      window.location.reload();
    });
  }
  cancel(){
    this.username = '';
    this.password = '';
  }
}
