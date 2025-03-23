import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, forkJoin, map, Observable } from "rxjs";
import { Move, Position, Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private readonly api: string = "http://localhost/chess.api/position";


  constructor(private http: HttpClient) { }

  public save(position: Position): Observable<Object> {
    let dirty = this.getDirtyPositions(position);
    console.log(dirty.map(p => p.move?.name));
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

  private private_save(position: Position): Observable<Object> {
    let p = new Position();
    p.id = position.id;
    p.description = position.description;
    p.move = position.move;
    p.parentId = position.parentId;
    p.tags = position.tags;
    p.title = position.title;
    p.positions = [];
    return this.http.post(this.api, p).pipe(finalize(() => {
        position.isDirty = false;
    }));
  }

  private getDirtyPositions(position: Position): Position[] {
    let positionJobs: Position[] = [];
    
    if(position.isDirty){
        console.log('dirty',position.move?.name)
      positionJobs.push(position);
    }

    position.positions.forEach(p => {
      positionJobs = positionJobs.concat(this.getDirtyPositions(p));
    })

    return positionJobs;
  }
}
