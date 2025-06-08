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
  pauseTime: number = 2.5;

  constructor(private router: Router, private settingsService: SettingsService){
    this.settingsService.showVariations$.subscribe(m => this.showVariations = m);
    this.settingsService.autoFavor$.subscribe(m => this.autoFavor = m);
  }

  toggleShowVariations() {
    this.settingsService.showVariations(!this.showVariations);
  }

  toggleAutoFavor() {
    this.settingsService.autoFavor(!this.autoFavor);
  }
}
