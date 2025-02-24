import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Study } from "../modules/computer-mode/models";
import { map, Observable } from "rxjs";

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
  
  public getSimpleStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.api + '/study/simplestudies').pipe(map((studies) => {
        return <Study[]>studies
    }));
  }
}