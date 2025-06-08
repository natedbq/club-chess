import { Component } from "@angular/core";
import { ActivateStudyService } from "../study/activate-study.service";

@Component({
  selector: 'app-study-control',
  templateUrl: './study-control.component.html',
  styleUrls: ['./study-control.component.css']
})
export class StudyControlComponent {
    active = false;
    constructor(private activateStudyService: ActivateStudyService){
        activateStudyService.play$.subscribe((p) => {
            this.active = p;
        })
    }

    public startStudy(){
        this.activateStudyService.startStudy();
    }

    public stopStudy(){
        this.activateStudyService.stopStudy();
    }
}