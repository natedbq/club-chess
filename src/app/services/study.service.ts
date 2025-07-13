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
    let s = new Study();
    s.id = study.id;
    s.description = study.description;
    s.perspective = study.perspective;
    s.summaryFEN = study.summaryFEN;
    s.title = study.title;
    s.positionId = study.positionId;
    s.accuracy = 0;
    s.tags = study.tags;

    return this.http.post(this.api + '/study', s);
  }

  public deleteStudy(id: string): Observable<Object> {
    return this.http.post(this.api + '/study/delete/' + id, null);
  }

  public getStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/studies').pipe(map((studies) => {
        return studies.map(s => Study.toStudy(s));
    }));
  }

  public getStudy(id: string): Observable<Study> {
    return this.http.get<Study>(this.api + '/study/studies/' + id).pipe(map((apiStudy) => {
      let study = Study.toStudy(apiStudy);
      return study;
  }));
  }
  
  public getSimpleStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/simplestudies').pipe(map((studies) => {
        return studies.map(s => {
          return Study.toStudy(s);
        })
    }));
  }  

  public study(id: string){
    return this.http.put(`${this.api}/study/${id}/study`, null);
  }
}