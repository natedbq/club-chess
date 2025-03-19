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

@NgModule({
  declarations: [
    AppComponent,
    ChessBoardComponent,
    ComputerModeComponent,
    RepertoireMenuComponent,
    StudyComponent,
    StudyNavigationComponent,
    StudyTitleComponent,
    StudyDescriptionComponent,
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
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
