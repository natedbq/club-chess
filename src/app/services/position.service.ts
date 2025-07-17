import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, forkJoin, lastValueFrom, map, mergeMap, Observable, of, tap } from "rxjs";
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

  public getByParentId(id: string, depth: number = 0): Observable<Position[]> {
    return this.http.get<Position[]>(this.api + `/parentId/${id}?depth=${depth}`).pipe(
      map(apiChildren => apiChildren.map(c => Position.toPosition(c))),
      mergeMap((children: Position[]) => {
        // Gather all tail node calls into an array of observables
        const tailCalls: Observable<any>[] = [];

        children.forEach(c => {
          c.positions.forEach(gc => {
            const tails = this.getTailNodes(gc);
            tails.forEach(t => {
              if (t.id) {
                const subCall = this.getByParentId(t.id, depth).pipe(
                  tap((subChildren) => {
                    t.positions = subChildren;
                  })
                );
                tailCalls.push(subCall);
              }
            });
          });
        });

        if (tailCalls.length === 0) {
          // No tail calls, return children immediately
          return of(children);
        }

        // Wait for all tail calls to complete before returning
        return forkJoin(tailCalls).pipe(map(() => children));
      })
    );
  }

  public mistake(id: string): Observable<Object> {
    return this.http.put(`${this.api}/${id}/mistake`, null);
  }

  public correct(id: string): Observable<Object> {
    return this.http.put(`${this.api}/${id}/correct`, null);
  }

  public delete(id: string): Observable<Object> {
    return this.http.post(this.api + `/delete/${id}`, null);
  }

  public study(id: string): Observable<Object> {
    return this.http.put(`${this.api}/${id}/study`, null);
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
    p.lastStudied = position.lastStudied;
    p.mistakes = position.mistakes;
    p.isKeyPosition = position.isKeyPosition;
    p.isActive = position.isActive;
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
