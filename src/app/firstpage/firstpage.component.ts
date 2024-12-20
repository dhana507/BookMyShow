import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { StateService } from '../state.service'
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-firstpage',
  templateUrl: './firstpage.component.html',
  styleUrls: ['./firstpage.component.css']
})
export class FirstpageComponent {
  public signin: number = 0;
  public signup: number = 0;
  constructor(private http: HttpClient, private router: Router,private stateserv:StateService,private toastr:ToastrService) { 
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.router.navigate(['/homepage']);
    }
  }
  signinbtn() {
    this.signin = 1;
    this.signup = 0;
  }

  removesignin() {
    this.signin = 0;
  }

  signupbtn() {
    this.signup = 1;
    this.signin = 0;
  }

  removesignup() {
    this.signup = 0;
  }

  /*login(email: String, password: String) {
   const body=new FormData();
   body.append('email',String(email));
   body.append('password',String(password));
    if(email==""){
      this.toastr.warning('Error', 'Please Enter email', {
        timeOut: 5000, 
        closeButton: true,
      });
    }else if(password==""){
      this.toastr.warning('Error', 'Please Enter password', {
        timeOut: 5000, 
        closeButton: true // Enables the close button
      });
    }else{
    this.http.post("http://localhost:5100/alllogin",body).subscribe((res: any) => {
      if (res.message == "User Successfully Login") {
      const expirationDuration = 10* 60 * 1000;
      const expirationTime = new Date().getTime() + expirationDuration;
      localStorage.setItem('userData',JSON.stringify({"email":String(email),"password":String(password),"expirationTime": expirationTime}));
      this.stateserv.set('firstpage',{username:res.username})
        this.toastr.success('Success', 'User Successfully Login', {
          timeOut: 5000, 
          closeButton: true // Enables the close button
        });
        this.router.navigate(['/homepage']);
      } else if(res.message == "Admin Successfully Login") {
        const expirationDuration = 3* 60 * 1000;
        const expirationTime = new Date().getTime() + expirationDuration;
        localStorage.setItem('userData',JSON.stringify({"email":String(email),"password":String(password),"expirationTime": expirationTime}));
        this.toastr.success('Success', 'Admin Successfully Login', {
          timeOut: 5000, 
          closeButton: true // Enables the close button
        });
        this.router.navigate(['/adminpage']);
      }else{
        this.toastr.error('Error', 'Invalid Details', {
          timeOut: 5000, 
          closeButton: true // Enables the close button
        });
      }
    });
  }
}

*/
login(email: string, password: string) {
  const body = new FormData();
  body.append('email', email);
  body.append('password', password);

  if (!email) {
      this.toastr.warning('Error', 'Please Enter email', { timeOut: 5000, closeButton: true });
  } else if (!password) {
      this.toastr.warning('Error', 'Please Enter password', { timeOut: 5000, closeButton: true });
  } else {
    
      this.http.post('http://localhost:5100/alllogin', body).subscribe((res: any) => {
          if (res.status === 'Success') {
              const token = res.token;
              localStorage.setItem('authToken', token); // Store JWT token
              const expirationDuration = res.message.includes('Admin') ? 3 * 60 * 1000 : 10 * 60 * 1000;
              const expirationTime = new Date().getTime() + expirationDuration;

              localStorage.setItem('userData', JSON.stringify({ email, token, expirationTime }));

              this.toastr.success('Success', res.message, { timeOut: 5000, closeButton: true });
              this.router.navigate([res.message.includes('Admin') ? '/adminpage' : '/homepage']);
          } else {
              this.toastr.error('Error', 'Invalid Details', { timeOut: 5000, closeButton: true });
          }
      });
  }
}


register(username: String, email: String, password: String) {

  const body=new FormData();
  body.append('username',String(username));
  body.append('email',String(email));
  body.append('password',String(password));
  if(username==""){
    this.toastr.warning('Error', 'Please Enter username', {
      timeOut: 5000, 
      closeButton: true,
    });
  }else if(email==""){
    this.toastr.warning('Error', 'Please Enter email', {
      timeOut: 5000, 
      closeButton: true // Enables the close button
    });
  }
  else if(password==""){
    this.toastr.warning('Error', 'Please Enter password', {
      timeOut: 5000, 
      closeButton: true // Enables the close button
    });
  }
  else{
  this.http.post("http://localhost:5100/register",body).subscribe((res: any) => {
   
    if (res.status === 'Success') {
      const token = res.token;
      localStorage.setItem('authToken', token); // Store JWT token
      const expirationDuration = res.message.includes('Admin') ? 20 * 60 * 1000 : 20 * 60 * 1000;
      const expirationTime = new Date().getTime() + expirationDuration;

      localStorage.setItem('userData', JSON.stringify({ email, token, expirationTime }));

      this.toastr.success('Success', res.message, { timeOut: 5000, closeButton: true });
      this.router.navigate(['/homepage']);
    } else {
      this.toastr.error('Error', 'User already exists! please Login', {
        timeOut: 5000, 
        closeButton: true // Enables the close button
      });
    }
  });
}
}
login123() {
  alert('User Login method called');
}

adminlogin123() {
  alert('Admin Login method called');
}
}
