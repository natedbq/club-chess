import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, of, shareReplay, switchMap, tap } from "rxjs";
import { Evaluation, ExploreNode, PV, Study } from "../chess-logic/models";
import { FIFOCache } from "../utilities/fifo-cache";
import { BoardUtility } from "../chess-logic/FENConverter";

@Injectable({
  providedIn: 'root'
})
export class LichessService {
  //TODO, no longer Lichess related, fix name
  private readonly api: string = "http://localhost/chess.api/stockfish";

  private exploreCache = new FIFOCache(3000);
  private cloudEvalCache = new FIFOCache(3000);
  private evaluateCache = new FIFOCache(500);
  private lichessRequestCache = new FIFOCache(30);

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

  public cloudEval(fen: string): Observable<Evaluation>{
    const key = `cloudEval:${fen}`;
    if(this.exploreCache.has(key)){
      return of(this.exploreCache.get(key));
    }

    if(this.lichessRequestCache.has(key)){
      return this.lichessRequestCache.get(key);
    }
    let obs =  this.http.get<Evaluation>(`https://lichess.org/api/cloud-eval?fen=${fen}&multiPv=4`)
      .pipe(map((data) => {
        console.log("first",JSON.stringify(data));
        data.pvs.forEach((p) => {
          p.moveNames = BoardUtility.getMoveNames(p.moves, fen);
        })
        return data;
      }))
      .pipe(tap((data) => {
        this.lichessRequestCache.delete(key);
        this.cloudEvalCache.put(key,data);
      }), shareReplay(1));
      this.lichessRequestCache.put(key,obs);
      return obs; 
  }
  
  public testexplore(fen: string, play: string): Observable<ExploreNode> {
    return of(<ExploreNode>{});
  }

  public explore(fen: string, play: string): Observable<ExploreNode> {
    const key = `${fen}:${play}`;
    if(this.exploreCache.has(key)){
      return of(this.exploreCache.get(key));
    }

    if(this.lichessRequestCache.has(key)){
      return this.lichessRequestCache.get(key);
    }
    let obs =  this.http.get<ExploreNode>('https://explorer.lichess.ovh/lichess?variant=standard&?fen=' + fen 
      + '&play='+play+'&speeds=blitz%2Crapid%2Cclassical%2Ccorrespondence&ratings=1600%2C1800%2C2000%2C2200%2C2500&source=analysis')
      .pipe(tap((data) => {
        this.lichessRequestCache.delete(key);
        const total = data.black + data.white + data.draws;
        data.moves.forEach((n) => {
          n.percent = (n.black + n.white + n.draws) / total;
        })
        this.exploreCache.put(key,data);
      }), shareReplay(1));
      this.lichessRequestCache.put(key,obs);
      return obs;
  }

}