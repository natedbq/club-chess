import { Component, Input, ViewChild } from '@angular/core';
import { Study } from '../../chess-logic/models';
import { StudyNavigator } from '../study/classes/study-navigator';

@Component({
  selector: 'app-study-description',
  templateUrl: './study-description.component.html',
  styleUrls: ['./study-description.component.css']
})
export class StudyDescriptionComponent {
  @Input() studyNav: StudyNavigator = new StudyNavigator(new Study());
  @Input() editable: boolean = true;
  @ViewChild('titleInput') titleInput: any;

  editingDescription: boolean = false;
  workingDescription: string = '';

  getDescription = (): string => {
    let desc = this.studyNav.getDescription();
    if(desc == ''){
      desc = '...';
    }
    return desc;
  }

  editDescription = (): void => {
    if(this.editable){
      this.editingDescription = true;
      this.workingDescription = this.getDescription();
      setTimeout(()=>{
        this.titleInput.nativeElement.focus();
      },0);
    }
  }

  commitDescription = (): void => {
    this.editingDescription = false;
    this.studyNav.setDescription(this.workingDescription);
    console.log(this.getDescription())
  }

}
