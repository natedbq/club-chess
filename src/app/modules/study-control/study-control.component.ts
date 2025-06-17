import { Component } from "@angular/core";
import { ActivateStudyService } from "../study/activate-study.service";
import { DrawingService } from "../drawing/drawing.service";

@Component({
  selector: 'app-study-control',
  templateUrl: './study-control.component.html',
  styleUrls: ['./study-control.component.css']
})
export class StudyControlComponent {
    active = false;
    constructor(private activateStudyService: ActivateStudyService, private drawingService: DrawingService){
        activateStudyService.play$.subscribe((p) => {
            this.active = p;
        })
    }

    public startStudy(){
        this.activateStudyService.startStudy();
        this.drawingService.setShape('none');
    }

    public stopStudy(){
        this.activateStudyService.stopStudy();
    }
}