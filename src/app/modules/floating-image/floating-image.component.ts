import { Component, Input } from '@angular/core';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';

@Component({
  selector: 'app-floating-image',
  templateUrl: './floating-image.component.html',
  styleUrls: ['./floating-image.component.css'],
})
export class FloatingImageComponent {
    @Input() src = '';
    @Input() top = 0;
    @Input() left = 0;
    @Input() visible = false;
    fadingOut = false;

    constructor(private imageService: FloatingImageService) {}
  
    ngOnInit() {
      this.imageService.src$.subscribe(src => this.src = src);
      this.imageService.position$.subscribe(pos => {
        this.top = pos.top;
        this.left = pos.left;
      });
      this.imageService.visible$.subscribe(v => {
        if (!v && this.visible) {
          this.fadingOut = true;
          this.visible = false;
        } else {
          this.fadingOut = false;
          this.visible = v;
        }
      });
    }
    onFadeOutEnd() {
      if (!this.visible && this.fadingOut) {
        this.fadingOut = false;
      }
    }
}