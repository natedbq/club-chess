import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
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
    this.loadMe().subscribe();
   }

  public loadMe(){
    return this.http.get<User>(`${this.api}/me`).pipe(tap((u) => {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(u));
      let user = User.toUser(u);
      this.userSubject.next(user);
      return user;
    }));
  }

  public getUser(): User | null {
    const saved = sessionStorage.getItem(this.USER_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  public getUserId(): string {
    return this.getUser()?.id ?? '';
  }

  public getUsername(): string {
    return this.getUser()?.username ?? '';
  }


  public logout() {
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }
  
  public getClubInvites(): Observable<ClubInvite[]> {
    return this.http.get<ClubInvite[]>(`${this.api}/${this.getUserId()}/invites`).pipe(map((invites) => {
        return invites.map(s => ClubInvite.toClubInvite(s));
    }));
  }
}