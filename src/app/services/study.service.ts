import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Move, Position, Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class StudyService {
  private readonly api: string = "http://localhost/chess.api";


  constructor(private http: HttpClient) { }

  public saveStudy(study: Study): Observable<Object> {
    return this.http.post(this.api + '/study', study);
  }

  public getStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/studies').pipe(map((studies) => {
        return studies.map(s => this.toStudy(s));
    }));
  }

  public getStudy(id: string): Observable<Study> {
    return this.http.get<Study>(this.api + '/study/studies/' + id).pipe(map((study) => {
      return this.toStudy(study)
  }));
  }
  
  public getSimpleStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/simplestudies').pipe(map((studies) => {
        return studies.map(s => {
          return this.toStudy(s);
        })
    }));
  }

  private toStudy(data: any): Study{
    let study = new Study();
    study.id = data.id;
    study.title = data.title;
    study.description = data.description;
    study.perspective = data.perspective;
    study.summaryFEN = data.summaryFEN;
    study.isDirty = false;

    if(data.position){
      study.position = this.toPosition(data.position);
    }
    return study;
  }

  private toMove(data: any): Move {
    let move = new Move();
    move.fen = data.fen;
    move.name = data.name;
    return move;
  }

  private toPosition(data: any): Position {
    let position = new Position();
    position.id = data.id;
    position.title = data.title;
    position.tags = data.tags;
    position.description = data.description;
    position.isDirty = false;
    if(data.move)
      position.move = this.toMove(data.move);
    if(data.positions){
      position.positions = data.positions.map((c: Position) => this.toPosition(c));
    }else{
      position.positions = [];
    }
    return position;
  }
}