import { Component, Input, ViewChild ,AfterViewInit, OnChanges, SimpleChanges  } from '@angular/core';
import { StudyNavigator } from '../study/classes/study-navigator';
import { Study } from '../../chess-logic/models';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';

@Component({
  selector: 'app-study-title',
  templateUrl: './study-title.component.html',
  styleUrls: ['./study-title.component.css']
})
export class StudyTitleComponent implements OnChanges {
  @Input() editable: boolean = true;
  @ViewChild('titleInput') titleInput: any;

  editingTitle: boolean = false;
  workingTitle: string = '';

constructor(private studyNavService: StudyNavigationService)
{

}

  isStudyDirty = (): boolean => {
    return this.studyNavService.isStudyDirty() || (this.studyNavService.getPointer()?.pointer?.isDirty ?? false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.workingTitle = '';
  }

  getTitle = (): string => {
    let title = this.studyNavService.getTitle();
    return title ? title : 'Untitled';
  }

  clearTitle = (): void => {
    this.studyNavService.setTitle('');
  }

  hasTitle(): boolean {
    return this.studyNavService.getTitle() != null;
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
    if(this.workingTitle != this.studyNavService.getTitle()){
      this.studyNavService.setTitle(this.workingTitle);
    }
  }

}
