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
  selector: 'app-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.css']
})
export class TagsEditComponent {

    name = "";
    adding = false;
    toAdd = "";
    tags: string[] = [];
    editTarget: TaggedObject | null = null;

    constructor(private studyService: StudyService, private positionService: PositionService, private navService: StudyNavigationService){
        navService.moveDetail$.subscribe(m => {
            if(m?.move?.name == '-'){
                this.editTarget = this.navService.getStudy();
                this.name = 'Study';
            }else{
                this.editTarget = m?.position ?? null;
                this.name = 'Position';
            }
            this.tags = this.editTarget?.tags ?? [];
        });
    }

    startAdding(){
        this.adding = true;
        this.toAdd = "";
    }

    add(){
        let x = this.toAdd.trim();
        this.toAdd = "";
        this.adding = false;
        if(this.tags.includes(x)){
            return;
        }
        this.tags.push(x);
        this.commit();
    }
    
    remove(tag: string){
        let index = this.tags.indexOf(tag);
        this.tags = this.tags.filter((_, j) => j != index);
        this.commit();
    }

    commit(){
        if(!this.editTarget){
            return;
        }
        let preserve: string[] = [];
        this.editTarget.tags.forEach((t) => {
            preserve.push(t);
        });
        this.navService.alertUpdate(UpdateType.Tags);
        this.editTarget.tags = this.tags;
        if(this.editTarget instanceof Position){
            this.editTarget.isDirty = true;

            this.positionService.save(this.editTarget).subscribe({
                error: err => {
                    if(this.editTarget instanceof Position){
                        this.editTarget.tags = preserve;
                        this.tags = this.editTarget?.tags ?? [];
                        this.editTarget.isDirty = false;
                    }
                },
                complete: () => {
                    if(this.editTarget instanceof Position){
                        this.editTarget.isDirty = false;
                    }
                    this.tags = this.editTarget?.tags ?? [];
                }
            });
        }else if(this.editTarget instanceof Study){
            this.editTarget.isDirty = true;
            this.studyService.saveStudy(this.editTarget).subscribe({
                error: err => {
                    if(this.editTarget instanceof Study){
                        this.editTarget.tags = preserve;
                        this.tags = this.editTarget?.tags ?? [];
                        this.editTarget.isDirty = false;
                    }
                },
                complete: () => {
                    if(this.editTarget instanceof Study){
                        this.editTarget.isDirty = false;
                    }
                    this.tags = this.editTarget?.tags ?? [];
                }
            });
        }
    }
}
