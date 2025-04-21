import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class LichessService {
  //TODO, no longer Lichess related, fix name
  private readonly api: string = "http://localhost/chess.api/stockfish";


  constructor(private http: HttpClient) { }

  public evaluate(fen: string): Observable<number> {
    return this.http.get<number>(this.api + '/eval?fen=' + fen).pipe(map(cp => {
      if(fen.includes(' b '))
        return cp *= -1;

      return cp;
    }));
  }

}