import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StateService } from '../state.service';

interface TheaterDetailsSchema {
  theatername: string;
  time: string;
  seats: string;
  price: string;
  allotseats: string;
  district: string;
  address: string;
  movietitle: string;
  date: string;
}

@Component({
  selector: 'app-bookticket',
  templateUrl: './bookticket.component.html',
  styleUrls: ['./bookticket.component.css'] // corrected "styleUrl" to "styleUrls"
})
export class BookticketComponent {
  public theatredetails: TheaterDetailsSchema[] = [];
  public rows = Array(7);
  public alphabetArray: string[] = [];
  public selectedSeats: string[] = [];
  public storedselectedSeats: string[] = [];
  public amount:number=0;
  public conformdiv:boolean=false;
  public detailsdiv:boolean=false;
  session:any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private stateserv: StateService
  ) {
    let session=localStorage.getItem('userData');
if (session) {
  this.session = JSON.parse(session);
  const currentTime = new Date().getTime();
  const expirationTime = this.session.expirationTime;

  if (currentTime >= expirationTime) {
    this.logout(); 
  } else {
    const remainingTime = expirationTime - currentTime;
    this.autoLogout(remainingTime); 
  }
}
    for (let i = 65; i < 65 + 7; i++) { 
      this.alphabetArray.push(String.fromCharCode(i));
    }

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      console.log('Navigation state:', navigation.extras.state);
      this.theatredetails = navigation.extras.state as TheaterDetailsSchema[];
      //alert(this.theatredetails[0]);
    } else {
      console.warn('No state passed during navigation');
    }
    this.getbookticketseats()
  }
  onSeatClick(seatId: string): void {
   // alert("present"+seatId+"last"+this.selectedSeats);
   if(!this.isStoredSeatSelected(seatId)){
    const index = this.selectedSeats.indexOf(seatId);
    if (index > -1) {
      
      this.selectedSeats.splice(index, 1);
    } else {
     
      this.selectedSeats.push(seatId);
    }
   
    this.amount=parseInt(this.theatredetails[0].price)*this.selectedSeats.length;
 
  }
  }
  logout(){
    this.session=undefined;
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    this.router.navigate([''])
  }
  autoLogout(expirationData: number){
    setTimeout(()=>{
      this.logout();
    },expirationData)
  }
  isSeatSelected(seatId: string): boolean {
    return this.selectedSeats.includes(seatId)== true && this.storedselectedSeats.includes(seatId)==false;
  }
  isStoredSeatSelected(seatId: string): boolean {
    return this.storedselectedSeats.includes(seatId);
  }
  getbookticketseats(){
    const body = new FormData();
  body.append('theatername', String(this.theatredetails[0].theatername));
  body.append('time', String(this.theatredetails[0].time));
  body.append('seats', String(this.theatredetails[0].seats));
  body.append('price', String(this.theatredetails[0].price));
  body.append('allotseats',String(this.theatredetails[0].allotseats));
  body.append('district', String(this.theatredetails[0].district));
  body.append('address', String(this.theatredetails[0].address));
  body.append('movietitle', String(this.theatredetails[0].movietitle));
  body.append('date', String(this.theatredetails[0].date));
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post("http://localhost:5100/getbookingtickets",this.theatredetails[0],{ headers }).subscribe((res:any)=>{
      this.storedselectedSeats=res.message;
      
    })
    this.amount=parseInt(this.theatredetails[0].price)*this.selectedSeats.length;
  }

payment(){
  if(this.selectedSeats.length==0){
    this.toastr.error('Error', 'Please select the seats', {
      timeOut: 3000, 
      closeButton: true // Enables the close button
    });
  }else{
  this.conformdiv=true;
  }
}
cancelbtn(){
  this.conformdiv=false;
}
acceptbtn(){
  this.conformdiv=false;
  this.detailsdiv=true;
}
cancelconformbtn(){
  this.detailsdiv=false;
}
 
        conformbtn(email: string, mobile: string, accountno: string) {
          const token = localStorage.getItem('authToken');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          this.http.post("http://localhost:5100/bookticket", {
              details: this.theatredetails[0],
              setnumbers: this.selectedSeats,
              totalamount: this.amount,
              email: email,
              mobile: mobile,
              accountno: accountno
          },{ headers }).subscribe({
              next: (res: any) => {
                  if (res.message === "Successfully booked") {
                      this.toastr.success('Success', 'Tickets Booked Successfully', {
                          timeOut: 3000,
                          closeButton: true
                      });
                      this.amount = 0;
                      this.conformdiv = false;
                      this.selectedSeats = [];
                      this.detailsdiv=false;
                      this.getbookticketseats();
                  } else {
                      this.toastr.error('Error', res.message, {
                          timeOut: 3000,
                          closeButton: true
                      });
                  }
              },
              error: (err) => {
                  this.toastr.error('Error', 'Something went wrong. Please try again later.', {
                      timeOut: 3000,
                      closeButton: true
                  });
              }
          });
      }
      
}
