import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Study } from "../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class StudyService {
  private readonly api: string = "http://localhost/chess.api";


  constructor(private http: HttpClient) { }

  public getStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/studies').pipe(map((studies) => {
        return <Study[]>studies
    }));
  }

  public getStudy(id: string): Observable<Study> {
    return this.http.get<Study>(this.api + '/study/studies/' + id).pipe(map((studies) => {
      return <Study>studies
  }));
  }
  
  public getSimpleStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/simplestudies').pipe(map((studies) => {
        return <Study[]>studies
    }));
  }
}