import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Study } from '../../chess-logic/models';
import { StudyNavigator } from '../study/classes/study-navigator';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { ToolComponent } from '../tool-menu/tool-menu.component';

@Component({
  selector: 'app-study-description',
  templateUrl: './study-description.component.html',
  styleUrls: ['./study-description.component.css']
})
export class StudyDescriptionComponent implements OnChanges {
  @Input() editable: boolean = true;
  @ViewChild('descInput') descInput: any;

  editingDescription: boolean = false;
  workingDescription: string = '';
  
  name: string = "Info";
  icon: string = "book";

  constructor(private studyNavService: StudyNavigationService){
  }

  getDescription = (): string => {
    let desc = this.studyNavService.getDescription();
    if(desc == ''){
      desc = '...';
    }
    return desc;
  }

  public ngOnChanges(changes: SimpleChanges){
      this.workingDescription = this.getDescription();
    }

  editDescription = (): void => {
    if(this.editable){
      this.editingDescription = true;
      let desc = this.getDescription();
      this.workingDescription = desc == '...' ? '' : desc;
      setTimeout(()=>{
        this.descInput.nativeElement.focus();
      },0);
    }
  }

  commitDescription = (): void => {
    this.editingDescription = false;
    if(this.workingDescription != this.studyNavService.getDescription()){
      this.studyNavService.setDescription(this.workingDescription);
    }
  }

}
