import { Component, Input, ViewChild ,AfterViewInit  } from '@angular/core';
import { StudyNavigator } from '../study/classes/study-navigator';
import { Study } from '../../chess-logic/models';

@Component({
  selector: 'app-study-title',
  templateUrl: './study-title.component.html',
  styleUrls: ['./study-title.component.css']
})
export class StudyTitleComponent {
  @Input() studyNav: StudyNavigator = new StudyNavigator(new Study());
  @Input() editable: boolean = true;
  @ViewChild('titleInput') titleInput: any;

  editingTitle: boolean = false;
  workingTitle: string = '';

  getTitle = (): string => {
    let title = this.studyNav.getTitle();
    if(title == ''){
      title = 'Untitled';
    }
    return title;
  }

  editTitle = (): void => {
    if(this.editable){
      this.editingTitle = true;
      this.workingTitle = this.getTitle();
      setTimeout(()=>{
        this.titleInput.nativeElement.focus();
      },0);
    }
  }

  commitTitle = (): void => {
    this.editingTitle = false;
    this.studyNav.setTitle(this.workingTitle);
  }

}
