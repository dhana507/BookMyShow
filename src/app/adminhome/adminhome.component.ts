import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StateService } from '../state.service';
import { ToastrService } from 'ngx-toastr';
interface State {
  state_id: number;
  state_name: string;
}

interface District {
  district_id: number;
  district_name: string;
}
interface theaterdetailsSchema{
  theatername:String,
  time:String,
  seats:String,
  price:String,
  allotseats:String,
  district:String,
  address:String,
  movieTitle:String,
   date:String;
}
interface MovieDetails {
  title: String,
  imagelink: String,
  imagelink2:String,
  trailervideolink: String,
  heroname: String,
  heroinename: String,
  district: String,
  herolink:String,
heroinelink:String,
directorname:String,
directorlink:String,
producername:String,
producerlink:String,
musicname:String,
musiclink:String,
}

interface StatesResponse {
  states: State[];
}

interface DistrictsResponse {
  districts: District[];
}

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.component.html',
  styleUrls: ['./adminhome.component.css']
})
export class AdminhomeComponent implements OnInit {
  public districtsdisplay: boolean = false;
  public locationselect: boolean = true;
  public newmovie: boolean = false;
  public showtheatrediv:boolean=false;
  public addtheater: boolean = false;
  public selectedMovieIndex: number | null = null;
  public selectedMovieSubIndex: number | null = null;
  slides: any[][] = [];
  public districts: District[] = [];
  public searchText: string = '';
  public locationname: string = '';
  public moviedetaileslist: MovieDetails[] = [];
  public alltheatredetails: theaterdetailsSchema[] = [];
  public selectedMovieTitle: string = '';
  public conformdiv:boolean=false;
  public session:any;
  public theaterdetails:any={
    theatername:String,
    time:String,
    seats:String,
    price:String,
    allotseats:String,
    district:String,
    address:String,
    movietitle:String,
    date:String,
  }
  public addmoviedetailes:any={
    title: String,
    imagelink: String,
    imagelink2:String,
    trailervideolink: String,
    heroname: String,
    heroinename: String,
    district: String,
    herolink:String,
heroinelink:String,
directorname:String,
directorlink:String,
producername:String,
producerlink:String,
musicname:String,
musiclink:String,
  }
  @ViewChild('searchTextInput') searchTextInput!: ElementRef;

  constructor(private http: HttpClient, private router: Router, private stateserv: StateService,private toastr: ToastrService) {
    let session=localStorage.getItem('userData');
if (session) {
  this.session = JSON.parse(session);
  const currentTime = new Date().getTime();
  const expirationTime = this.session.expirationTime;

  if (currentTime >= expirationTime) {
    this.logout(); // If the session is expired, log out the user
  } else {
    const remainingTime = expirationTime - currentTime;
    this.autoLogout(remainingTime); // Schedule autoLogout for remaining time
  }
}
  }

  ngOnInit(): void {
    const savedState = this.stateserv.get('adminhome');
    if (savedState) {
      this.districts = savedState.districts;
      this.searchText = savedState.searchText;
      this.locationname = savedState.locationname;
      this.moviedetaileslist = savedState.moviedetaileslist;
      this.districtsdisplay = savedState.districtsdisplay;
      this.locationselect = savedState.locationselect;
    }
  }

  getAllStates() {
    
    this.http.get<StatesResponse>("https://cdn-api.co-vin.in/api/v2/admin/location/states").subscribe((res: StatesResponse) => {
      const states = res.states;
      states.forEach((state: State) => {
        this.getDistricts(state.state_id).subscribe((districtRes: DistrictsResponse) => {
          this.districts.push(...districtRes.districts);
          this.districts.sort((a, b) => a.district_name.localeCompare(b.district_name));
        });
      });
      this.districtsdisplay = true;
    });
  }


 

 
 getmoviedetailes(): void {
  const payload = { district: this.locationname };
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  this.http.post<MovieDetails[]>("http://localhost:5100/getmoviedetails", payload,{ headers }).subscribe(
    (res: MovieDetails[]) => {
      this.moviedetaileslist = res;

      if (this.moviedetaileslist && this.moviedetaileslist.length > 0) {
        this.slides = this.getSlides();
      } else {
        this.toastr.warning('Warning', 'No movies found in the specified district', {
          timeOut: 3000,
          closeButton: true,
        });
        this.moviedetaileslist = [];
        this.slides = [];
      }
    },
    (error) => {
      console.error('Error fetching movie details:', error);
      this.toastr.error('Error', 'Failed to fetch movie details', {
        timeOut: 3000,
        closeButton: true,
      });
    }
  );
}

    
  getDistricts(stateId: number): Observable<DistrictsResponse> {
    return this.http.get<DistrictsResponse>(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`);
  }

  hideDetails() {
    this.districtsdisplay = false;
  }

  onSearchChange() {
    this.searchText = this.searchTextInput.nativeElement.value.toLowerCase();
  }
  removeshowdetails(){
    this.showtheatrediv=false;
  }
  location(district: string) {
    this.locationname = district;
    this.locationselect = false;
    this.getmoviedetailes();
  }
  showTheatre(e:string): void {
  
    this.selectedMovieIndex = null;
    this.selectedMovieSubIndex = null;
  this.showtheatrediv=true;
  this.selectedMovieTitle = e;
  const payload = { movietitle: String(e) };
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  this.http.post<theaterdetailsSchema[]>("http://localhost:5100/gettheatredetails", payload,{ headers }).subscribe((res: theaterdetailsSchema[]) => {
    this.alltheatredetails= res;
  
  });
  
 
  }


  displaylocationfield() {
    this.locationselect = true;
  }

  get filteredDistricts() {
    if (!this.searchText) {
      return this.districts;
    }
    return this.districts.filter(district => 
      district.district_name.toLowerCase().includes(this.searchText)
    );
  }

  toggleOption(slideIndex: number, itemIndex: number): void {
    if (this.selectedMovieIndex === slideIndex && this.selectedMovieSubIndex === itemIndex) {
      this.selectedMovieIndex = null;
      this.selectedMovieSubIndex = null;
    } else {
      this.selectedMovieIndex = slideIndex;
      this.selectedMovieSubIndex = itemIndex;
    }
  }

  deleteMovie(slideIndex: number, itemIndex: number,e:string): void {
    this.selectedMovieIndex = null;
    this.selectedMovieSubIndex = null;
    this.conformdiv=true;
  this.selectedMovieTitle=e;
    }
    cancelbtn(){
this.conformdiv=false;
    }
    autoLogout(expirationData: number){
      setTimeout(()=>{
        this.logout();
      },expirationData)
    }
    logout(){
      this.session=undefined;
      localStorage.removeItem('userData');
      this.router.navigate([''])
    }
    conformbtn(){
      this.conformdiv=false;
      const body=new FormData();
      body.append("movietitle",String(this.selectedMovieTitle));
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post("http://localhost:5100/deletemovie",body,{ headers }).subscribe((res:any)=>{
        if(res.message=="Successfully Deleted"){
            this.toastr.success('Success', 'Movie deleted successfully', {
              timeOut: 3000, 
              closeButton: true // Enables the close button
            });
          
          this.getmoviedetailes();
        }else{
          this.toastr.error('Error', 'Movie not  deleted ', {
            timeOut: 3000, 
            closeButton: true // Enables the close button
          });
        
        }})
    }
    deletetheater(e: String,event?:Event): void {
      if (event) {
        event.preventDefault(); // Prevent default navigation, if needed
    }
      this.selectedMovieIndex = null;
      this.selectedMovieSubIndex = null;
      const body=new FormData();
      body.append("theatername",String(e));
      body.append("movietitle",String(this.selectedMovieTitle));
      body.append("district",String(this.locationname));
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post("http://localhost:5100/deletetheatre", 
      body,{ headers })
      .subscribe({
          next: (res: any) => {
          
              if (res.message === "Successfully Deleted") {

                  this.toastr.success('Success', 'Theater deleted successfully', {
                      timeOut: 3000, 
                      closeButton: true
                  });
                  this.showTheatre(this.selectedMovieTitle);
               
              } else {
                this.toastr.error('Error', 'Theater not  deleted', {
                  timeOut: 3000, 
                  closeButton: true
              });
              }
          },
          error: (error: any) => {
              console.error('Error:', error);
              this.toastr.error('Error', 'Failed to delete theater', {
                  timeOut: 3000, 
                  closeButton: true
              });
          },
          complete: () => {
              console.log('Delete theater request completed');
          }
      });
  }
  
  
  removecross(){
    this.selectedMovieIndex = null;
    this.selectedMovieSubIndex = null;
  }
  removeaddteatermovie(){
    this.addtheater=false;
  }
  addMovie(movieTitle:string): void {
    this.selectedMovieIndex = null;
    this.selectedMovieSubIndex = null;
    this.addtheater=true;
    this.selectedMovieTitle = movieTitle;
   
  }

  getSlides(): any[][] {
    const slides: any[][] = [];
    const itemsPerSlide = 4;
    let totalItems = this.moviedetaileslist.length;
    let k = 0;
    if(this.moviedetaileslist.length>0){ 
     if(this.moviedetaileslist.length<=4){
      const slide = [];
      for (let j = 0; j < this.moviedetaileslist.length; j++) {
        slide.push(this.moviedetaileslist[j]);
      }
      slides.push(slide);
      return slides;
     }
    while (totalItems - itemsPerSlide >= 0) {
      const slide = [];
      for (let j = k; j < k + itemsPerSlide; j++) {
        slide.push(this.moviedetaileslist[j]);
      }
      slides.push(slide);
      k += itemsPerSlide;
      totalItems -= itemsPerSlide;
    }
    if (totalItems > 0) {
      const slide = [];
      for (let j = (k+totalItems-itemsPerSlide); j < this.moviedetaileslist.length; j++) {
        slide.push(this.moviedetaileslist[j]);
      }
      slides.push(slide);
    }
        
  return slides;
    }
    return slides;
}
  addnewmovie(){
this.newmovie=true
  }
  removeaddmovie(){
    this.newmovie=false;
  }
  addmoviebtn(title:String,link:String,link2:String,trailer:String,hero:String,heroine:String,herolink:String,heroinelink:String,director:String,directorlink:String,producer:String,producerlink:String,music:String,musiclink:String){
    const body = new FormData();
    body.append('title', String(title));
    body.append('imagelink', String(link));
    body.append('imagelink2', String(link2));
    body.append('trailervideolink', String(trailer));
    body.append('heroname', String(hero));
    body.append('heroinename', String(heroine));
    body.append('district', String(this.locationname));
    body.append('herolink', String(herolink));
    body.append('heroinelink', String(heroinelink));
    body.append('directorname', String(director));
    body.append('directorlink', String(directorlink));
    body.append('producername', String(producer));
    body.append('producerlink', String(producerlink));
    body.append('musicname',String(music));
    body.append('musiclink', String(musiclink));
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post("http://localhost:5100/addnewmovie",body,{ headers }).subscribe((res:any)=>{
      if(res.message=="Successfully Added"){
       
        this.newmovie=false
        this.getmoviedetailes();
        // this.toastr.success('Successfully Added');
        this.toastr.success('Success', 'Movie Added successfully', {
          timeOut: 3000, 
          closeButton: true // Enables the close button
        });
      
      }else{
        //this.toastr.error(res.message);
        this.toastr.error('Error', 'Movie not Added', {
          timeOut: 3000, 
          closeButton: true // Enables the close button
        });
      }})
     
  }
 
addTheaterbtn(theater: string, address: string, time: string, seats: string, price: string, date: string): void {
  if (!theater || !address || !time || !seats || !price || !date) {
    this.toastr.error('Error', 'All fields are required', {
      timeOut: 3000,
      closeButton: true,
    });
    return;
  }

  const body = new FormData();
  body.append('theatername', String(theater));
  body.append('time', String(time));
  body.append('seats', String(seats));
  body.append('price', String(price));
  body.append('allotseats', "");
  body.append('district', String(this.locationname));
  body.append('address', String(address));
  body.append('movietitle', String(this.selectedMovieTitle));
  body.append('date', String(date));
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  this.http.post("http://localhost:5100/addtheater", body,{ headers }).subscribe(

    (res: any) => {
       if (res.message === "Successfully Added") {
        this.addtheater = false;
        this.toastr.success('Success', 'Theater successfully added', {
          timeOut: 3000,
          closeButton: true,
        });
      } else {

        this.toastr.error('Error', 'Failed to add theater', {
          timeOut: 3000,
          closeButton: true,
        });
      }
    },
    (error) => {
      console.error('Error adding theater:', error);
      this.toastr.error('Error', 'Failed to add theater due to server error', {
        timeOut: 3000,
        closeButton: true,
      });
    }
  );
}
}

