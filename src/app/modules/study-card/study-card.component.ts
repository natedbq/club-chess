import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ActivateStudyService } from "../study/activate-study.service";
import { DrawingService } from "../drawing/drawing.service";
import { FloatingImageService } from "../../services/floating-image/floating-image.service";
import { Router } from "@angular/router";
import { MoveDelegation, MoveDelegator } from "../../chess-logic/moveDelegator";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";
import { StudyService } from "../../services/study.service";
import { ExternalBoardControlService } from "../chess-board/external-board-control.service";
import { Color, Move, MoveData, Study } from "../../chess-logic/models";

class StudyCard extends Study {
    moveData: MoveData | null = null;
}



@Component({
  selector: 'app-study-card',
  templateUrl: './study-card.component.html',
  styleUrls: ['./study-card.component.css']
})
export class StudyCardComponent implements OnChanges {
    @Input() study: Study | null = null;
    studyPreview: StudyCard | null = null;
    constructor(){
        
    }
    ngOnChanges(changes: SimpleChanges): void {
        if(this.study){
            this.studyPreview = <StudyCard>this.study;
            let move = new Move();
            move.fen = this.study.summaryFEN;
            move.name = "";
            move.from = "";
            move.to = "";
            this.studyPreview.moveData = {
                move: move,
                studyId: null,
                studyTitle: null,
                source: null,
                direction: null,
                player: this.study.perspective ?? Color.White,
                extra: null
            };
        }
    }
    
}
