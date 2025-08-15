import { NgModule } from "@angular/core";
import { ChessBoardComponent } from "../modules/chess-board/chess-board.component";
import { ComputerModeComponent } from "../modules/computer-mode/computer-mode.component";
import { RouterModule, Routes } from "@angular/router";
import { RepertoireMenuComponent } from "../modules/repertoire-menu/repertoire-menu.component";
import { StudyComponent } from "../modules/study/study.component";
import { ClubExploreComponent } from "../modules/club/explore/club-explore.component";

const routes: Routes = [
    { path: "club-explorer", component: ClubExploreComponent, title: "Club Explorer" },
    { path: "repertoire-menu", component: RepertoireMenuComponent, title: "Practice Repertoire" },
    { path: "study/:id", component: StudyComponent, title: "Study" }

]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }