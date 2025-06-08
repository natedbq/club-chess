import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 

import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { ComputerModeComponent } from './modules/computer-mode/computer-mode.component';
import { NavMenuComponent } from './modules/nav-menu/nav-menu.component';
import { AppRoutingModule } from './routes/app-routing.module';
import { PlayAgainstComputerDialogComponent } from './modules/play-against-computer-dialog/play-against-computer-dialog.component';
import { MoveListComponent } from './modules/move-list/move-list.component';
import { RepertoireMenuComponent } from './modules/repertoire-menu/repertoire-menu.component';
import { StudyComponent } from './modules/study/study.component';
import { StudyNavigationComponent } from './modules/study-navigation/study-navigation.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudyTitleComponent } from './modules/study-title/study-title.component';
import { StudyDescriptionComponent } from './modules/study-description/study-description.component';
import { NewStudyDialogComponent } from './modules/new-study-dialog/new-study-dialog.component';
import { ConfirmDialogComponent } from './modules/confirm-dialog/confirm-dialog-component';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FloatingImageComponent } from './modules/floating-image/floating-image.component';
import { DevToolsComponent } from './modules/dev-tools/dev-tools.component';
import { ToolNameDirective } from './directives/tool-name/tool-name.directive';
import { ToolComponent, ToolMenuComponent } from './modules/tool-menu/tool-menu.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { MoveEditorComponent } from './modules/move-editor/move-editor.component';
import { SaveStudyComponent } from './modules/save-study/save-study.component';
import { ActivateStudyService } from './modules/study/activate-study.service';
import { StudyControlComponent } from './modules/study-control/study-control.component';

@NgModule({
  declarations: [
    AppComponent,
    StudyControlComponent,
    ChessBoardComponent,
    ComputerModeComponent,
    RepertoireMenuComponent,
    DevToolsComponent,
    StudyComponent,
    StudyNavigationComponent,
    SettingsComponent,
    StudyTitleComponent,
    SaveStudyComponent,
    StudyDescriptionComponent,
    FloatingImageComponent,
    ToolNameDirective,
    ToolMenuComponent,
    ToolComponent,
    MoveEditorComponent    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NavMenuComponent,
    PlayAgainstComputerDialogComponent,
    NewStudyDialogComponent,
    MoveListComponent,
    CommonModule, MatButtonModule, MatIconModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    InputSwitchModule,
    ConfirmDialogComponent,
    InputNumberModule,
    SliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
