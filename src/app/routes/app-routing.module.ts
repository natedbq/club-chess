import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RepertoireMenuComponent } from "../modules/repertoire-menu/repertoire-menu.component";
import { StudyComponent } from "../modules/study/study.component";
import { ClubExploreComponent } from "../modules/club/explore/club-explore.component";
import { ClubHomeComponent } from "../modules/club/club-home/club-home.component";
import { WelcomeComponent } from "../modules/welcome/welcome.component";

const routes: Routes = [
    { path: "", component: WelcomeComponent, title: "Club-Chess" },
    { path: "club-explorer", component: ClubExploreComponent, title: "Club Explorer" },
    { path: "repertoire-menu", component: RepertoireMenuComponent, title: "Practice Repertoire" },
    { path: "study/:id", component: StudyComponent, title: "Study" },
    { path: "club/:id", component: ClubHomeComponent, title: "Club Home" }

]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }