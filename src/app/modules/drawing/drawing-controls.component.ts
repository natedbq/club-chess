import { Component, HostListener } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { SettingsService } from '../settings/settings.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { Move, Position } from '../../chess-logic/models';
import { DrawingService } from './drawing.service';
import { ActivateStudyService } from '../study/activate-study.service';

@Component({
  selector: 'app-drawing-controls',
  templateUrl: './drawing-controls.component.html',
  styleUrls: ['./drawing-controls.component.css']
})
export class DrawingControlsComponent {
  shape: string = 'none';
  enable: boolean = false;
  color: string = 'red'
  colors = [
    'red','dark-blue','green'
  ];

  constructor(private drawingService: DrawingService){
    drawingService.shape$.subscribe((s) => {
      this.enable = s != 'none';
    })
  }

  
  @HostListener('window:mousedown', ['$event'])
  onGlobalMouseDown(event: MouseEvent) {
    this.drawingService.start(event.clientX, event.clientY);
  }

  @HostListener('window:mouseup', ['$event'])
  onGlobalMouseUp(event: MouseEvent) {
    this.drawingService.stop(event.clientX, event.clientY);
  }
  
  undo(){
    this.drawingService.undo();
  }

  toggleEnable(){
    this.enable = !this.enable;
    this.drawingService.setShape(this.enable ? 'shape' : 'none');
  }

  select(shape: string){
  }

  selectColor(color: string){
    this.color = color;
    this.drawingService.setColor(color);
  }
}
