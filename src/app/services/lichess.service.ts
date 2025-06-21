import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ExploreNode, Study } from "../chess-logic/models";

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

  public explore(fen: string, play: string): Observable<ExploreNode> {
    return this.http.get<ExploreNode>('https://explorer.lichess.ovh/lichess?variant=standard&?fen=' + fen 
      + '&play='+play+'&speeds=blitz%2Crapid%2Cclassical%2Ccorrespondence&ratings=1600%2C1800%2C2000%2C2200%2C2500&source=analysis');
  }

}