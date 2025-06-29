import { Component } from "@angular/core";
import { ActivateStudyService } from "../study/activate-study.service";
import { DrawingService } from "../drawing/drawing.service";
import { FloatingImageService } from "../../services/floating-image/floating-image.service";
import { Router } from "@angular/router";
import { MoveDelegation, MoveDelegator } from "../../chess-logic/moveDelegator";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";
import { StudyService } from "../../services/study.service";

@Component({
  selector: 'app-study-control',
  templateUrl: './study-control.component.html',
  styleUrls: ['./study-control.component.css']
})
export class StudyControlComponent {
    active = false;
    constructor(private router: Router, private activateStudyService: ActivateStudyService, private drawingService: DrawingService, private floatingImageService: FloatingImageService,
        private studyNavService: StudyNavigationService, private studyService: StudyService
    ){
        activateStudyService.play$.subscribe((p) => {
            this.active = p;
        });

        this.router.events.subscribe(event => {
            this.activateStudyService.stopStudy();
            MoveDelegator.clear();
            
        });
    }

    public startStudy(){
        this.activateStudyService.startStudy();
        this.drawingService.setShape('none');
        const study = this.studyNavService.getStudy();
        if(study?.id){
            this.studyService.study(study.id).subscribe();
        }
    }

    public stopStudy(){
        this.activateStudyService.stopStudy();
        this.floatingImageService.hideImage();
    }
}
