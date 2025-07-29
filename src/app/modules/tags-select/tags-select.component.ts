import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { StudyService } from "../../services/study.service";
import { Position, Study, TaggedObject } from "../../chess-logic/models";
import { PositionService } from "../../services/position.service";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";

interface TagSelection {
    isSelected: boolean;
    tag: string;
}

@Component({
  selector: 'app-tags-select',
  templateUrl: './tags-select.component.html',
  styleUrls: ['./tags-select.component.css']
})
export class TagsSelectComponent {

    adding = false;
    toAdd = "";
    tags: TagSelection[] = [];
    limit: string[] | null = null;
    study: Study | null = null;
    doubleClick: string | null = null;

    constructor(private studyService: StudyService, private positionService: PositionService, private studyNavService: StudyNavigationService){
        this.studyNavService.study$.subscribe(s => {
            this.study = s;
            this.refreshTags();
        })
    }

    refreshTags(){
        this.limit = this.studyNavService.getPositionTags();
        this.tags = [];
        if(this.limit){
            this.limit.forEach(ltag => {
                this.tags.push({
                    tag: ltag,
                    isSelected: this.study?.focusTags?.some(stag => stag === ltag) ?? false
                });
            })
        }
    }

    modify(tag: TagSelection){
        if(this.doubleClick == tag.tag){
            this.isolate(tag);
            this.doubleClick = null;
        }else{
            this.toggle(tag);
            this.doubleClick = tag.tag;
            setTimeout(() => {
                this.doubleClick = null;
            }, 500);
        }
    }

    toggle(tag: TagSelection){
        tag.isSelected = !tag.isSelected;
        this.commit();
    }

    isolate(tag: TagSelection){
        this.tags.forEach(t => {
            if(t.tag != tag.tag){
                t.isSelected = false;
            }else{
                t.isSelected = true;
            }
        });
        this.commit();
    }

    commit(){
        if(!this.study){
            return;
        }
        if(this.study){
            this.study.focusTags = this.tags.filter(t => t.isSelected).map(t => t.tag);
            this.studyService.saveStudy(this.study).subscribe();
        }
    }
}
