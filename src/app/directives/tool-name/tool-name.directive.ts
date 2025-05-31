import { Directive, Input, OnInit, TemplateRef } from '@angular/core';

@Directive({
  selector: '[toolName]'
})
export class ToolNameDirective implements OnInit{
  @Input('toolName') name!: string;
  @Input('toolIcon') icon!: string;

  constructor(public templateRef: TemplateRef<any>) {
  }

  ngOnInit() {
    console.log(this.name, this.icon)
  }
}
