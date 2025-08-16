import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ActivateStudyService } from "../study/activate-study.service";
import { DrawingService } from "../drawing/drawing.service";
import { FloatingImageService } from "../../services/floating-image/floating-image.service";
import { Router } from "@angular/router";
import { MoveDelegation, MoveDelegator } from "../../chess-logic/moveDelegator";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";
import { StudyService } from "../../services/study.service";
import { Position, Study, TaggedObject, UpdateType } from "../../chess-logic/models";
import { PositionService } from "../../services/position.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

}
