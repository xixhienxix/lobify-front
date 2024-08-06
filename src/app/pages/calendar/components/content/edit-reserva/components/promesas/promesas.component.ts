import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { DateTime } from "luxon";
import { Observable, Subject, of as observableOf } from "rxjs";
import { Promesa } from "src/app/pages/calendar/_models/promesas.model";
import { PromesaService } from "src/app/services/promesas.service";

@Component({
    selector: 'app-promesas',
    templateUrl: './promesas.component.html',
    styleUrls: ['./promesas.component.scss']
  })

export class PromesasComponent implements OnInit{
    constructor(private _promesasService: PromesaService,
      private changeDetectorRefs: ChangeDetectorRef
        ){}
    @ViewChild(MatSort) sort: MatSort;

    clickedRow = new Set<any>()
    dataSource = new  MatTableDataSource<Promesa>();
    displayedColumns: string[] = ['select','_id','Fecha', 'Cantidad', 'Estatus','Accion','Color','ColorAplicado'];
    promesasPagoList:Promesa[]=[]

    @Input() promesasSubject: Subject<Promesa[]>;
    @Input() folio:string='';

    @Output() honEliminarPromesa: EventEmitter<string> = new EventEmitter();
    // @Output() honPreguntasPrevias: EventEmitter<boolean> = new EventEmitter();
    @Output() honEstatusAplicado: EventEmitter<boolean> = new EventEmitter();

    ngOnInit(){
        this._promesasService.getcurrentPromesaValue.subscribe({
            next:(value)=>{
                this.processPromesasResponse(value);
            }
        });
    }
    processPromesasResponse(result:Promesa[]){
        let today = DateTime.now()
                    for(let i =0;i<result.length;i++){
                      
                      let color =''
                      let colorAplicado='' //amarillo
                      let expirado 
                  
                      let todayMillis = today.toMillis()
    
                      const dateParts50:string = result[i].Fecha.toString().split("T")[0];
                      const dateObject = DateTime.fromISO(dateParts50); 
    
                      if(result[i].Aplicado === false)
                      {
    
                        colorAplicado='#f7347a'//rosa
                        color='#68B29A'
                        if(dateObject.toMillis()<todayMillis)
                        {
                          let status = 'Expirado'
                          expirado='Expirado'
                          color='#D47070'//rosa
                          const _id= result[i]._id!
                          this._promesasService.updatePromesaEstatus(_id,status).subscribe()
                        }
    
                        if(dateObject.toMillis()>todayMillis)
                        {
                          expirado='Vigente'
                          color='#68B29A'//verde
                        }
    
                        this.promesasPagoList[i] = {
                          _id:result[i]._id,
                          Folio:result[i].Folio,
                          Fecha:result[i].Fecha,
                          Cantidad:result[i].Cantidad,
                          Expirado:expirado,
                          Aplicado:result[i].Aplicado,
                          Color:color,
                          ColorAplicado:colorAplicado,
                          Estatus:result[i].Estatus
                        }
    
                      }else if(result[i].Aplicado===true)
                      
                      {
                        expirado=result[i].Estatus
    
                          color='#0A506A'//Azul 
                          colorAplicado='#0A506A'//Azul 
    
                      
                          this.promesasPagoList[i] = {
                          _id:result[i]._id,
                          Folio:result[i].Folio,
                          Fecha:result[i].Fecha,
                          Cantidad:result[i].Cantidad,
                          Expirado:expirado,
                          Aplicado:result[i].Aplicado,
                          Color:color,
                          ColorAplicado:colorAplicado,
                          Estatus:result[i].Estatus

                        }

                      }
                      // this.dataSource.paginator = this.paginator ;
                      // this.changingPromesasValue.next(promesasPagoList);
                    }
                    this.dataSource.data = this.promesasPagoList;  
                    this.dataSource.sort = this.sort;
                    this.changeDetectorRefs.detectChanges();

      }

    formatDate(date:string){
      return date.split("T")[0] + "<br>" + date.split("T")[1].split(".")[0]
    }

    eliminarPromesa(_id:string){
        this.honEliminarPromesa.emit(_id);
    }

    // preguntasPrevias(row:boolean){
    //     this.honPreguntasPrevias.emit(row);
    // }

    estatusAplicado(row:boolean){
        this.honEstatusAplicado.emit(row);
    }
}