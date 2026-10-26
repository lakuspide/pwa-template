import { TestBed } from '@angular/core/testing';
import { TermsSectionComponent } from './terms-section.component';

describe('TermsSectionComponent', () => {
  let component: TermsSectionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TermsSectionComponent],
    });
    component = TestBed.createComponent(TermsSectionComponent).componentInstance;
  });

  it('pins each sheet one header below the previous one', () => {
    expect(component.stackTop(0)).toBe(152);
    expect(component.stackTop(1) - component.stackTop(0)).toBe(56);
    expect(component.stackTop(3)).toBe(320);
  });

  it('caps the sheet height so the last sheet can still reach its pin', () => {
    // 80 px of footer chrome + the pin of the last of four sections (320 px).
    expect(component.sheetMinHeight()).toBe('min(50vh, calc(100dvh - 400px))');
  });
});
