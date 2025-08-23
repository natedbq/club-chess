import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Club, ClubInvite, Move, Position, Study, User } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api: string = "http://localhost/chess.api/user";
  private USER_KEY = 'app_user';

  private userSubject = new BehaviorSubject<any>(this.getUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getUser();
   }

  public getUser(): User | null {
    const saved = localStorage.getItem(this.USER_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  public getUserId(): string {
    return this.getUser()?.id ?? '';
  }

  public getUsername(): string {
    return this.getUser()?.username ?? '';
  }

  public login(username: string, password: string){
    return this.http.post<User>(`${this.api}/auth`, {username, password}).pipe(map((user) => {
      if(user){
        let u = User.toUser(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(u));
      }

      this.userSubject.next(user);

      return user;
    }));
  }

  public logout() {
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }
  
  public getClubInvites(): Observable<ClubInvite[]> {
    return this.http.get<ClubInvite[]>(`${this.api}/${this.getUserId()}/invites`).pipe(map((invites) => {
        return invites.map(s => ClubInvite.toClubInvite(s));
    }));
  }
}