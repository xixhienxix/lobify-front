import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table-widget11',
  templateUrl: './table-widget11.component.html',
  styleUrls: ['./table-widget11.component.scss']
})
export class TableWidget11Component implements OnInit{
  @Input() title: string = ''
  @Input() subTitle: string = ''
  @Input() buttonHeader: string = 'Button'
  @Input() classCol1: string = 'ps-4 min-w-225px rounded-start'
  @Input() columnClass: string = 'min-w-125px'
  @Input() classColActions: string = 'min-w-200px text-end rounded-end'
  @Input() rows: any={}
  @Input() columns: string[] = []

  @Output() honRowEditSelection: EventEmitter<any> = new EventEmitter();
  @Output() honRowDeleteSelection: EventEmitter<any> = new EventEmitter();


  constructor(){

  }
  ngOnInit(){}

  editButton(selectedRow:any){
    this.honRowEditSelection.emit(selectedRow)
  }

  deleteButton(selectedRow:any){
    this.honRowDeleteSelection.emit(selectedRow)
  }

}
