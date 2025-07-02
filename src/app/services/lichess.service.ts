import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, of, shareReplay, tap } from "rxjs";
import { ExploreNode, Study } from "../chess-logic/models";
import { FIFOCache } from "../utilities/fifo-cache";

@Injectable({
  providedIn: 'root'
})
export class LichessService {
  //TODO, no longer Lichess related, fix name
  private readonly api: string = "http://localhost/chess.api/stockfish";

  private exploreCache = new FIFOCache(3000);
  private evaluateCache = new FIFOCache(500);
  private requestCache = new FIFOCache(20);

  constructor(private http: HttpClient) { }

  public evaluate(fen: string): Observable<number> {
    const key = fen;
    if(this.evaluateCache.has(key)){
      return of(this.evaluateCache.get(key));
    }

    return this.http.get<number>(this.api + '/eval?fen=' + fen).pipe(map(cp => {
      if(fen.includes(' b '))
        return cp *= -1;

      return cp;
    })).pipe(tap(data => this.evaluateCache.put(key, data)), shareReplay(1));
  }
  
  public testexplore(fen: string, play: string): Observable<ExploreNode> {
    return of(<ExploreNode>{});
  }

  public explore(fen: string, play: string): Observable<ExploreNode> {
    const key = `${fen}:${play}`;
    if(this.exploreCache.has(key)){
      return of(this.exploreCache.get(key));
    }

    if(this.requestCache.has(key)){
      return this.requestCache.get(key);
    }
    let obs =  this.http.get<ExploreNode>('https://explorer.lichess.ovh/lichess?variant=standard&?fen=' + fen 
      + '&play='+play+'&speeds=blitz%2Crapid%2Cclassical%2Ccorrespondence&ratings=1600%2C1800%2C2000%2C2200%2C2500&source=analysis')
      .pipe(tap((data) => {
        this.requestCache.delete(key);
        const total = data.black + data.white + data.draws;
        data.moves.forEach((n) => {
          n.percent = (n.black + n.white + n.draws) / total;
        })
        this.exploreCache.put(key,data);
      }), shareReplay(1));
      this.requestCache.put(key,obs);
      return obs;
  }

}