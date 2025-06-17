import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, forkJoin, lastValueFrom, map, Observable } from "rxjs";
import { Move, Position, Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private readonly api: string = "http://localhost/chess.api/position";


  constructor(private http: HttpClient) { }

  public save(position: Position): Observable<Object> {
    let dirty = this.getDirtyPositions(position);
    var tasks = dirty.map(p => this.private_save(p));
    tasks.forEach(t => {
        t.subscribe({
          
            complete: () => console.log(`Position ${position.move?.name} saved`),
            error : (e) => console.error('Error saving position:', e)
          }
          );
    })
    return forkJoin(tasks);
  }

  public getByParentId(id: string, depth:number = 0): Observable<Position[]> {
    return this.http.get<Position[]>(this.api + `/parentId/${id}?depth=${depth}`).pipe(map((apiChildren) => {
        let children = apiChildren.map(c => Position.toPosition(c));
        let tails: Position[] = [];
        children.forEach(c => {
            c.positions.forEach(gc => {
                tails = tails.concat(this.getTailNodes(gc));
            });
        });

        tails.forEach(t => {
            if(t.id){
                lastValueFrom(this.getByParentId(t.id, depth)).then(c => {
                    t.positions = c;
                });
            }
        })

        return children;
    }))
  }

  public delete(id: string): Observable<Object> {
    return this.http.post(this.api + `/delete/${id}`, null);
  }

  private getTailNodes(position: Position): Position[] {
    let tails: Position[] = [];

    if(position.positions.length == 0){
        tails.push(position);
    }else{
        position.positions.forEach(p => {
            tails = tails.concat(this.getTailNodes(p));
        });
    }

    return tails;
  }

  private private_save(position: Position): Observable<Object> {
    let p = new Position();
    p.id = position.id;
    p.description = position.description;
    p.move = position.move;
    p.parentId = position.parentId;
    p.tags = position.tags;
    p.title = position.title;
    p.plans = position.plans;
    p.positions = [];
    return this.http.post(this.api, p).pipe(finalize(() => {
        position.isDirty = false;
    }));
  }

  private getDirtyPositions(position: Position): Position[] {
    let positionJobs: Position[] = [];
    
    if(position.isDirty){
      positionJobs.push(position);
    }

    position.positions.forEach(p => {
      positionJobs = positionJobs.concat(this.getDirtyPositions(p));
    })

    return positionJobs;
  }
}
