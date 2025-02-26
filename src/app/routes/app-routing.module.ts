import { NgModule } from "@angular/core";
import { ChessBoardComponent } from "../modules/chess-board/chess-board.component";
import { ComputerModeComponent } from "../modules/computer-mode/computer-mode.component";
import { RouterModule, Routes } from "@angular/router";
import { RepertoireMenuComponent } from "../modules/repertoire-menu/repertoire-menu.component";
import { StudyComponent } from "../modules/study/study.component";

const routes: Routes = [
    { path: "against-friend", component: ChessBoardComponent, title: "Play against friend" },
    { path: "against-computer", component: ComputerModeComponent, title: "Play against computer" },
    { path: "repertoire-menu", component: RepertoireMenuComponent, title: "Practice Repertoire" },
    { path: "study/:id", component: StudyComponent, title: "Study" }

]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }