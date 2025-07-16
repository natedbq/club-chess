import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { StudyService } from "../../services/study.service";
import { Position, Study, StudySettings, TaggedObject } from "../../chess-logic/models";
import { PositionService } from "../../services/position.service";

interface TagSelection {
    isSelected: boolean;
    tag: string;
}

@Component({
  selector: 'app-tags-select',
  templateUrl: './tags-select.component.html',
  styleUrls: ['./tags-select.component.css']
})
export class TagsSelectComponent implements OnChanges {

    name = "";
    adding = false;
    toAdd = "";
    tags: TagSelection[] = [];
    @Input() limit: string[] | null = null;
    @Input() selectTarget: TaggedObject | null = null;
    @Input() study: Study | null = null; //required if we set target to StudySettings object

    constructor(private studyService: StudyService, private positionService: PositionService){
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.refreshTags();
        if(this.selectTarget instanceof Position){
            this.name = this.selectTarget.move?.name ?? 'Position';
        } else if(this.selectTarget instanceof Study){
            this.name = 'Study';
        } else if(this.selectTarget instanceof StudySettings){
            this.name = 'Focus';
        }
    }

    refreshTags(){
        this.tags = [];
        if(this.limit && this.selectTarget){
            this.limit.forEach(ltag => {
                this.tags.push({
                    tag: ltag,
                    isSelected: this.selectTarget?.tags.some(stag => stag === ltag) ?? false
                });
            })
        }
    }

    modify(tag: string){
        let filtered = this.tags.filter(t => t.tag == tag);
        if(filtered.length > 0){
            let editTag = filtered[0];
            editTag.isSelected = !editTag.isSelected;
        }
        this.commit();
    }

    commit(){
        if(!this.selectTarget){
            return;
        }
        let preserve: string[] = [];
        this.selectTarget.tags.forEach((t) => {
            preserve.push(t);
        })
        this.selectTarget.tags = this.tags.map(t => t.tag);
        if(this.selectTarget instanceof Position){
            this.selectTarget.isDirty = true;

            this.positionService.save(this.selectTarget).subscribe({
                error: err => {
                    if(this.selectTarget instanceof Position){
                        this.selectTarget.tags = preserve;
                        this.refreshTags();
                        this.selectTarget.isDirty = false;
                    }
                },
                complete: () => {
                    if(this.selectTarget instanceof Position){
                        this.selectTarget.isDirty = false;
                    }
                    this.refreshTags();
                }
            });
        }else if(this.selectTarget instanceof Study || (this.selectTarget instanceof StudySettings && this.study != null)){
            this.selectTarget.isDirty = true;
            if(this.study){
                this.studyService.saveStudy(this.study).subscribe({
                    error: err => {
                        if(this.selectTarget instanceof Study){
                            this.selectTarget.tags = preserve;
                            this.refreshTags();
                            this.selectTarget.isDirty = false;
                        }
                    },
                    complete: () => {
                        if(this.selectTarget instanceof Study){
                            this.selectTarget.isDirty = false;
                        }
                        this.refreshTags();
                    }
                });
            }
        }
    }
}
