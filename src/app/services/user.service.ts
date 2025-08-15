import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Club, Move, Position, Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api: string = "http://localhost/chess.api/user";


  constructor(private http: HttpClient) { }


  public getUserId(): string {
    return '0B0063E1-FD1C-402B-8D3C-5EA27DE96689';
  }
}