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
import { StudyControlComponent } from './modules/study-control/study-control.component';
import { DrawingControlsComponent } from './modules/drawing/drawing-controls.component';
import { ExploreComponent } from './modules/explore/explore.component';
import { EngineExploreComponent } from './modules/engine-explore/engine-explore.component';
import { GraphicalMoveComponent } from './modules/graphical-move/graphical-move.component';
import { LoadingComponent } from './modules/loading/loading.component';
import { MoveControlsComponent } from './modules/move-controls/move-controls.component';
import { ScoreComponent } from './modules/score/score.component';
import { TagsEditComponent } from './modules/tags-edit/tags-edit.component';
import { TagsSelectComponent } from './modules/tags-select/tags-select.component';
import { StudySearchComponent } from './modules/study-search/study-search.component';
import { ClubExploreComponent } from './modules/club/explore/club-explore.component';
import { ClubHomeComponent } from './modules/club/club-home/club-home.component';
import { StudyCardComponent } from './modules/study-card/study-card.component';
import { WelcomeComponent } from './modules/welcome/welcome.component';
import { LoginComponent } from './modules/dialogs/login/login.component';
import { SendInviteComponent } from './modules/dialogs/sendInvite/send-invite.component';
import { MembersComponent } from './modules/club/club-home/members/members.component';

@NgModule({
  declarations: [
    LoginComponent,
    SendInviteComponent,
    AppComponent,
    StudyControlComponent,
    ChessBoardComponent,
    MembersComponent,
    ComputerModeComponent,
    ExploreComponent,
    RepertoireMenuComponent,
    EngineExploreComponent,
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
    DrawingControlsComponent,
    MoveControlsComponent,
    GraphicalMoveComponent,
    LoadingComponent,
    ScoreComponent,
    TagsEditComponent,
    StudySearchComponent,
    TagsSelectComponent,
    MoveEditorComponent,
    StudyCardComponent,
    WelcomeComponent,

    ClubExploreComponent,
    ClubHomeComponent
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
    SliderModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
