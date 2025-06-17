import { HostListener, Injectable } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import Konva from 'konva';
import Circle from 'konva';
import Arrow from 'konva';
import { Position } from "../../chess-logic/models";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";
import { SettingsService } from "../settings/settings.service";
import { Layer } from "konva/lib/Layer";
import { ActivateStudyService } from "../study/activate-study.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
    private color: string = 'red';
    private active: boolean = false;
    private tries = 0;
    private stage: Konva.Stage | null = null;
    private strokeWidth = 6;
    startCoord: coord = {x:0,y:0};
    stopCoord: coord = {x:0,y:0};

    
    private _shape = new BehaviorSubject<string>('none');
    

    shape$ = this._shape.asObservable();
    

    constructor(private router: Router, private studyNavService: StudyNavigationService, 
        private settingsService: SettingsService,
        private activateStudyService: ActivateStudyService){
        this.scanForCanvas();
        this.router.events.subscribe(event => {
            this.stage = null;
              if (event instanceof NavigationStart) {
                this.scanForCanvas();
                this.tries = 0;
              }
            });
        this.studyNavService.moveDetail$.subscribe((m) => {
            this.scanForCanvas();
            this.draw();
        });
        this.settingsService.showPlans$.subscribe((p) => {
            this.clear();
            this.draw();
        })
    }


    start(x: number, y: number){
        if(this._shape.value == 'none'){
            return;
        }
        let rect = document.getElementById('canvas')?.getBoundingClientRect();

        if(rect){
            let squareSize = (rect?.right - rect?.left) / 8;
    
            this.startCoord = <coord>{x: Math.floor((x - rect.left) / squareSize), y: Math.floor((y -  rect.top) / squareSize)};
        }
    }
    stop(x: number, y: number){
        if(this._shape.value == 'none'){
            return;
        }
        const rect = document.getElementById('canvas')?.getBoundingClientRect();

        if(rect){
            let squareSize = (rect?.right - rect?.left) / 8
    
            this.stopCoord = <coord>{x: Math.floor((x - rect.left) / squareSize), y: Math.floor((y -  rect.top) / squareSize)};
            this.addShape();
        }
    }

    public undo(){
        let position = this.studyNavService.getPointer()?.pointer;
        if(position){
            let index = position.plans.lastIndexOf(';');
            if(index > 0){
                position.plans = position.plans.substring(0, index);
                this.draw();
                position.isDirty = true;
            }else if(position.plans.length > 0){
                position.plans = '';
                this.draw();
                position.isDirty = true;
            }
        }
    }

    addShape(){
        if(this._shape.value == 'none'){
            return;
        }
        if(this.startCoord.x < 0 || this.stopCoord.x < 0
         || this.startCoord.x > 7 || this.stopCoord.x > 7
         || this.stopCoord.y < 0 || this.stopCoord.y < 0
         || this.startCoord.y > 7 || this.stopCoord.y > 7){
            return;
         }
        if(this.startCoord.x == this.stopCoord.x && this.startCoord.y == this.stopCoord.y){
            this.addCircle();
        }else{
            this.addArrow();
        }
    }

    public addArrow(){
        let position = this.studyNavService.getPointer()?.pointer;
        
        if(position){
            if(position.plans.length > 0){
                position.plans += ";";
            }
            let plan =  `arrow.${this.color}.${this.startCoord.x}.${this.startCoord.y}.${this.stopCoord.x}.${this.stopCoord.y}`;
            this.addOrRemovePlan(plan, position);
            this.draw();
        }

    }

    public addCircle(){
        let position = this.studyNavService.getPointer()?.pointer;
        
        if(position){
            if(position.plans.length > 0){
                position.plans += ";";
            }
            let plan = `circle.${this.color}.${this.startCoord.x}.${this.startCoord.y}`;
            this.addOrRemovePlan(plan, position);
            this.draw();
        }

    }

    public addOrRemovePlan(plan: string, position: Position){
        let parts = plan.split('.');
        parts[1] = '[^;]*?'
        let regex = parts.join('\\.');
        const pattern = new RegExp(regex);
        let newPlans = position.plans.replace(pattern, '');
        if(newPlans.length == position.plans.length){
            if(position.plans.length > 0){
                position.plans += ";";
            }
            position.plans += plan;
        }else{
            position.plans = newPlans;
        }
        position.plans = position.plans.replaceAll(new RegExp(';+', 'g'),";")
        position.isDirty = true;
    }

    scanForCanvas(){
        if(this.stage){
            return;
        }

        const el = document.getElementById('canvas');
        if(el || this.tries >= 100){
            this.initiate();
        }else{
            setTimeout(() => {
                this.tries += 1;
                this.scanForCanvas();
                
            }, 100);
        }
    }

    initiate(){
        this.stage = new Konva.Stage({
            container: "canvas",
            width: 800,
            height: 800
        });
        this.draw();
    }

    clear() {
        if(this.stage){
            this.stage.removeChildren();
        }
    }

    draw() {
        if(!this.stage || !this.settingsService.showPlans()){
            return;
        }

        let position = this.studyNavService.getPointer()?.pointer;

        this.stage.removeChildren();

        var layer = new Konva.Layer({});


        position?.plans.split(';').forEach((s) => {
            let vars = s.split(".");
            if(vars[0] == 'circle'){
                let circle = new Konva.Circle({
                    x: Number(vars[2]) * 100 + 50,
                    y: Number(vars[3]) * 100 + 50,
                    radius: 50,
                    stroke: getComputedStyle(document.documentElement).getPropertyValue('--'+vars[1]).trim(),
                    strokeWidth: this.strokeWidth
                });
                layer.add(circle);
            }
            if(vars[0] == 'arrow'){
                let arrow = new Konva.Arrow({
                    points: [Number(vars[2]) * 100 + 50, Number(vars[3]) * 100 + 50, Number(vars[4]) * 100 + 50, Number(vars[5]) * 100 + 50],
                    fill: getComputedStyle(document.documentElement).getPropertyValue('--'+vars[1]).trim(),
                    stroke: getComputedStyle(document.documentElement).getPropertyValue('--'+vars[1]).trim(),
                    strokeWidth: this.strokeWidth,
                    pointerLength: 20,
                    pointerWidth: 20
                });
                layer.add(arrow);
            }
        })


        this.stage.add(layer);
    }

    public setColor(color: string){
        this.color = color;
    }

    public setShape(shape: string){
        this._shape.next(shape);
        
        if(this._shape.value == 'none'){
            this.activateStudyService.unlockBaord();
        }else{
            this.activateStudyService.lockBaord();
        }
    }
}

interface coord {
    x: number; 
    y: number;
}