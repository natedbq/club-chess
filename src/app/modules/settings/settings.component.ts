import { Component } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, Move, MoveData } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  moveData: MoveData | null = null;
  showVariations: boolean = true;
  autoFavor: boolean = true;
  pauseTime: number = 1;
  showPlans: boolean = true;
  autoNextLine: boolean = true;
  favorUnvisited: boolean = true;

  constructor(private router: Router, private settingsService: SettingsService){
    this.settingsService.showVariations$.subscribe(m => this.showVariations = m);
    this.settingsService.autoFavor$.subscribe(m => this.autoFavor = m);
    this.settingsService.pauseTime$.subscribe(t => this.pauseTime = t);
    this.settingsService.showPlans$.subscribe(t => this.showPlans = t);
    this.settingsService.autoNextLine$.subscribe(b => this.autoNextLine = b);
  }

  toggleFavorUnvisited() {
    this.settingsService.setFavorUnvisited(!this.favorUnvisited);
  }

  toggleShowVariations() {
    this.settingsService.setShowVariations(!this.showVariations);
  }

  toggleShowPlans() {
    this.settingsService.setShowPlans(!this.showPlans);
  }

  toggleAutoFavor() {
    this.settingsService.setAutoFavor(!this.autoFavor);
  }

  toggleAutoNextLine() {
    this.settingsService.setAutoNextLine(!this.autoNextLine);
  }
}
