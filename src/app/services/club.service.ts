import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Club, Move, Position, Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private readonly api: string = "http://localhost/chess.api/club";


  constructor(private http: HttpClient) { }


  public getClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.api).pipe(map((clubs) => {
        return clubs.map(s => Club.toClub(s));
    }));
  }
}