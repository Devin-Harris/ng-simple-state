import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSimpleStateComponent } from './ngx-simple-state.component';

describe('NgxSimpleStateComponent', () => {
  let component: NgxSimpleStateComponent;
  let fixture: ComponentFixture<NgxSimpleStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxSimpleStateComponent]
    });
    fixture = TestBed.createComponent(NgxSimpleStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
