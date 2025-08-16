import { AfterContentInit, Component, ContentChildren, ElementRef, Input, QueryList, Renderer2 } from '@angular/core';
import { ToolNameDirective } from '../../directives/tool-name/tool-name.directive';


@Component({
  selector: 'app-tool',
  template: '<ng-content></ng-content>',
  styleUrls: ['./tool-menu.component.css']
})
export class ToolComponent {
  @Input() name!: string;
  @Input() icon!: string;

  public selected: boolean = false;

  constructor(public el: ElementRef, private renderer: Renderer2){}

  public select(){
    this.selected = true;
    this.renderer.removeClass(this.el.nativeElement, 'hide');
  }

  public deselect() {
    this.selected = false;
    this.renderer.addClass(this.el.nativeElement, 'hide');
  }
}

@Component({
  selector: 'app-tool-menu',
  templateUrl: './tool-menu.component.html',
  styleUrls: ['./tool-menu.component.css']
})
export class ToolMenuComponent implements AfterContentInit {
  @ContentChildren(ToolComponent as any, { descendants: true })
  tools!: QueryList<ToolComponent>;

  selectedTool?: ToolComponent;
  @Input() hideSave: boolean = false;
  @Input() width: string = '400px';
  @Input() height: string = '100%';
  @Input() orientation: string = 'side';
  @Input() backgroundColor: string = 'none'
  
  
  constructor() {}

  ngAfterContentInit() {
    let selectedTool = this.tools.first;

    this.tools.forEach(tool => {
      tool.deselect();
    });

    selectedTool.select();
  }

  selectTool(tool: ToolComponent) {
    this.tools.forEach(tool => {
      tool.deselect();
    });
    tool.select();
  }
}
