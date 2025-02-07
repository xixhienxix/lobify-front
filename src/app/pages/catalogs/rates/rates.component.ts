import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Tarifas } from 'src/app/models/tarifas';
import { TarifasService } from 'src/app/services/tarifas.service';
import { SpecialRatesComponent } from './special-rates/special-rates.component';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Prompt } from 'src/app/models/prompt.model';
import { TempRatesComponent } from './temp-rates/temp.rates.component';
import { ExpressRatesComponent } from './express-rates/express.rates.component';


@Component({
  selector: 'app-special-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.scss']
})
export class RatesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //DOM
  isLoading: boolean;

  //Table
  displayedColumns: string[] = ['Tarifa', 'Habitacion', 'Tarifas_Activa', 'Visible_en','Cancelacion','Acciones'];
  dataSource = new MatTableDataSource<any>();
  displayedColumnsTemporada: string[] = ['Tarifa', 'Temporada', 'Tarifas Activas', 'Habitacion', 'Visibilidad', 'Cancelacion','Estado','Acciones'];
  dataSourceTemporada = new MatTableDataSource<any>();
  displayedColumnsEspecial: string[] = ['Tarifa', 'Temporada', 'Tarifas Activas', 'Habitacion', 'Visibilidad', 'Cancelacion','Estado','Acciones'];
  dataSourceEspecial = new MatTableDataSource<any>();

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  /**Flags */
  reloading:boolean=false;

  /**Models */
  cuartosArray:Habitacion[]=[];
  codigoCuarto:Habitacion[]=[]

  options = [
    {name:'Lun', value:'0', checked:false},
    {name:'Mar', value:'1', checked:false},
    {name:'Mie', value:'2', checked:false},
    {name:'Jue', value:'3', checked:false},
    {name:'Vie', value:'4', checked:false},
    {name:'Sab', value:'5', checked:false},
    {name:'Dom', value:'6', checked:false}
  ]
  tarifaRackArr:any[]=[]
  tarifaRackCompleto:Tarifas[]=[]
  tarifaEspecialArray:Tarifas[]=[]
  tarifaTemporadaArray:Tarifas[]=[]


  // ratesArray:Tarifas[]=[];
  // ratesArrayComplete:Tarifas[]=[];
  
  /**Variables */
  closeResult:string
  
  private ngUnsubscribe = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    public fb : FormBuilder,
    public _tarifasService:TarifasService,
    public modalService:NgbModal,
    public _habitacionService:HabitacionesService
  ) { 
    const sb =this._tarifasService.getNotification().subscribe(data=>{
      if(data){
        this.getTarifas(false);
      }
    });
    this.subscriptions.push(sb)
  }

  ngOnInit(): void {
    this.getTarifas(false);
    this.getHabitaciones(true);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async getTarifas(refreshTable:boolean){
    let dataSourceBS

    if(refreshTable){
      this._tarifasService.getAll()
      .pipe(
        takeUntil(this.ngUnsubscribe)).subscribe({
          next: ()=>{
            dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
            this.tarifaRackCompleto=dataSourceBS
            this.buildDataSource(dataSourceBS);
            this.reloading=false;
        },
        error: (err)=>{
          console.log(err);
          this.promptMessage('Error','No se pudieron cargar las tarifas intente de nuevo mas tarde')
        },
        complete:()=>{
        }
        })
    }

    const ratesIndexDB:Tarifas[] = await this._habitacionService.readIndexDB("Rates");
    
    if(ratesIndexDB){
      if(ratesIndexDB.length !== 0){
        this._tarifasService.setCurrentTarifasValue = ratesIndexDB
        dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
        this.tarifaRackCompleto = ratesIndexDB
        this.buildDataSource(dataSourceBS);
  
        this.isLoading = false
        this.reloading = false
      }else{
        this._tarifasService.getAll()
        .pipe(
          takeUntil(this.ngUnsubscribe)).subscribe({
            next: ()=>{
              dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
              this.tarifaRackCompleto=dataSourceBS
              this.buildDataSource(dataSourceBS);
  
          },
          error: (err)=>{
            console.log(err);
            this.promptMessage('Error','No se pudieron cargar las tarifas intente de nuevo mas tarde')
          },
          complete:()=>{
          }
          })
      }
    } else 
    {
      this._tarifasService.getAll()
      .pipe(
        takeUntil(this.ngUnsubscribe)).subscribe({
          next: ()=>{
            dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
            this.tarifaRackCompleto=dataSourceBS
            this.buildDataSource(dataSourceBS);
            this.isLoading = false
            this.reloading = false
        },
        error: (err)=>{
          console.log(err);
          this.promptMessage('Error','No se pudieron cargar las tarifas intente de nuevo mas tarde')
        },
        complete:()=>{
        }
        })
      }
  }

  buildDataSource(data:Tarifas[]){
    this.dataSourceEspecial.data=[];
    this.dataSource.data=[];
    this.dataSourceTemporada.data=[];
    this.tarifaEspecialArray=[];
    this.tarifaRackArr=[];
    this.isLoading=true;

    this.tarifaRackCompleto = data;

    this.tarifaEspecialArray = this.tarifaRackCompleto.filter((val)=> val.Tarifa !== 'Tarifa Base' && val.Tarifa !== 'Tarifa De Temporada');
    // this.tarifaEspecialArray = this.tarifaRackCompleto.filter((val)=> val.Tarifa !== 'Tarifa De Temporada');

    this.tarifaRackArr = this.tarifaRackCompleto.filter((val)=> val.Tarifa === 'Tarifa Base' );
    this.tarifaTemporadaArray = this.tarifaRackCompleto.filter((val)=> val.Tarifa === 'Tarifa De Temporada' );


            /*Borra Duplicados*/
    var borraDuplicados = this.tarifaEspecialArray.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.Tarifa === value.Tarifa
          )));

    this.dataSource.data=this.tarifaRackArr     
    this.dataSourceEspecial.data=borraDuplicados 
    this.dataSourceTemporada.data = this.tarifaTemporadaArray   
    this.isLoading = false
    this.reloading = false
  }

  formatDates(element:Tarifas){
    const llegada = new Date(element.Llegada);
    const salida = new Date(element.Salida);

    return llegada.toDateString() + '<br>' + salida.toDateString();
  }

  tarifasActivas(element:Tarifas){
    if(element.Tarifa === 'Tarifa Base' && element.TarifasActivas.length === 0){
      return element.TarifasActivas.map((item)=>{
        if(item.Activa===true){
          let nameTarifa = item.Descripcion

          return nameTarifa + '<br>' 
        }
      }); 
    }else{
      const tableString = element.TarifasActivas.map((item)=>{
        if(item.Activa===true){
          let nameTarifa = item.Descripcion
          const dias_validos:any=[]
          // let diasValidos = item.Dias.map((item2)=>{
          //     if(item2.checked === true){
          //       dias_validos.push(item2.name);
          //       return item2.name
          //     }
            
          // })
          const joiningDias = dias_validos.join('-');
          return nameTarifa + '<br>' +  joiningDias
        }
      }); 
      return tableString.join('<br>')
    }

  }

  async getHabitaciones(refreshTable:boolean){

    if(refreshTable){
      this._habitacionService.getAll().pipe(
        takeUntil(this.ngUnsubscribe)).subscribe({
          next:()=>{
            this.cuartosArray = this._habitacionService.getcurrentHabitacionValue.getValue()
        }
      });
    }

    const roomsCodesIndexDB:Habitacion[] = await this._habitacionService.readIndexDB("Rooms");
    if(roomsCodesIndexDB){
      if(roomsCodesIndexDB.length !== 0){
        this._habitacionService.setcurrentHabitacionValue = roomsCodesIndexDB
        this.cuartosArray = this._habitacionService.getcurrentHabitacionValue.getValue()
      }else{
        this._habitacionService.getAll().pipe(
          takeUntil(this.ngUnsubscribe)).subscribe(
          ()=>{
            this.cuartosArray = this._habitacionService.getcurrentHabitacionValue.getValue()
        })
      }
    }else
    {
       this._habitacionService.getAll().pipe(
        takeUntil(this.ngUnsubscribe)).subscribe(
        ()=>{
          this.cuartosArray = this._habitacionService.getcurrentHabitacionValue.getValue()
      });
    }
  }

  listaHabitacionesActivas(row:Tarifas){
    return row.Habitacion.join('<br>');
  }

  visibleEn(row:Tarifas){
    return row.Visibilidad.subTask?.filter(item=>item.value === true).map(item=>{ return item.name }).join('<br>');
  }

  politicasTable(row:Tarifas){
    return row.Politicas?.filter(item=> item.value === true).map(item => { return item.name }).join('<br>');
  }

  promtDelete(tarifa:Tarifas){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Advertencia'
        modalRef.componentInstance.mensaje='Estas seguro que deseas eliminar la tarifa para la habitación '+tarifa.Tarifa+''          
        modalRef.result.then((result) => {
          if(result=='Aceptar')        
          {
            this.deleteTarifaRackEspecial(tarifa)
            this.tarifaEspecialArray=[]
          } 
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
  }

  promptMessage(header:string,message:string){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje= message    
    modalRef.result.then((result) => {
      if(result=='Aceptar')        
      {
      } 
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      setTimeout(() => {
        modalRef.close('Close click');
      },4000)
      return
  }

  editTarifaTemporada(row:any){
    const modalref = this.modalService.open(TempRatesComponent,{size:'md',backdrop:'static'})
    modalref.componentInstance.tarifa=row
    modalref.componentInstance.cuartosArray = this.cuartosArray
    modalref.componentInstance.onTarifaSubmit.subscribe({
      next:(tarifa:Tarifas)=>{
        this._tarifasService.updateTarifas(tarifa).subscribe({
          next:()=>{
            this.promptMessage('Exito','Tarifa(s) Generada(s) con éxito')
            this._tarifasService.sendNotification(true);
            this,modalref.close();        
          },
          error:()=>{
            this.promptMessage('Error','No se pudo guardar la tarifa intente de nuevo mas tarde')
          }
        })
      },
      error:()=>{

      }
    });
    modalref.componentInstance.onAlertsEvent.subscribe({
      next:(value:Prompt)=>{
        this.promptMessage(value.title,value.message);
      }
    })
  }


  deleteTarifaRackEspecial(element:Tarifas){

      this._tarifasService.deleteTarifaEspecial(element).subscribe({
        next:()=>{
          this.promptMessage('Exito','Tarifa Eliminada con éxito' )
          // this._tarifasService.sendNotification(true);
          this.getTarifas(false);
        },
        error: (error)=>{
          this.promptMessage('Error','No se pudo eliminar la tarifa intente de nuevo mas tarde')
          console.log(error)
        }
      })
      
  }

  editTarifaEspecial(row:any){
    const modalref = this.modalService.open(SpecialRatesComponent,{size:'md',backdrop:'static'})
    modalref.componentInstance.tarifa=row
    modalref.componentInstance.cuartosArray = this.cuartosArray
    modalref.componentInstance.onTarifaSubmit.subscribe({
      next:(tarifa:Tarifas)=>{
        this._tarifasService.updateTarifas(tarifa).subscribe({
          next:()=>{
            this.promptMessage('Exito','Tarifa(s) Generada(s) con éxito')
            this._tarifasService.sendNotification(true);
            this,modalref.close();        
          },
          error:()=>{
            this.promptMessage('Error','No se pudo guardar la tarifa intente de nuevo mas tarde')
          }
        })
      },
      error:()=>{

      }
    });
    modalref.componentInstance.onAlertsEvent.subscribe({
      next:(value:Prompt)=>{
        this.promptMessage(value.title,value.message);
      }
    })
  }

  updateTarifaBase(tarifa:Tarifas){
    this._tarifasService.updateTarifas(tarifa).subscribe({
      next:()=>{
        this.getTarifas(true);
        this.promptMessage('Exito', 'Tarifa Actualizada con Exito');
      },
      error:()=>{
        this.promptMessage('Error','No se pudo guardar el cambio en la tarifa, intente de nuevo');
      }
    });
  }

  nvaTarifaEspecial(){
    const modalRef = this.modalService.open(SpecialRatesComponent,{size:'md',backdrop:'static'});
    modalRef.componentInstance.cuartosArray = this.cuartosArray
    modalRef.componentInstance.onNameAlreadyExist.subscribe({
      next:(value:boolean)=>{
        if(value){
          this.promptMessage('Error','El Nombre de la Tarifa ya existe, utilize otro')
        }
      }
    })
    modalRef.componentInstance.tarifasArray = this.tarifaRackCompleto
    modalRef.componentInstance.onTarifaSubmit.subscribe({
      next:(tarifa:Tarifas)=>{
        this._tarifasService.postTarifaEspecial(tarifa).subscribe({
          next:()=>{
            this.promptMessage('Exito','Tarifa(s) Generada(s) con éxito')
            this._tarifasService.sendNotification(true);
            modalRef.close();        
          },
          error:()=>{
            this.promptMessage('Error','No se pudo guardar la tarifa intente de nuevo mas tarde')
          }
        })
      },
      error:()=>{

      }
    });
    modalRef.componentInstance.onAlertsEvent.subscribe({
      next:(value:Prompt)=>{
        this.promptMessage(value.title,value.message);
      }
    })
  }


  nvaTarifaTemporada(){
    const modalRef = this.modalService.open(TempRatesComponent,{size:'md',backdrop:'static'});
    modalRef.componentInstance.cuartosArray = this.cuartosArray
    modalRef.componentInstance.onNameAlreadyExist.subscribe({
      next:(value:boolean)=>{
        if(value){
          this.promptMessage('Error','El Nombre de la Tarifa ya existe, utilize otro')
        }
      }
    })
    modalRef.componentInstance.tarifasArray = this.tarifaRackCompleto
    modalRef.componentInstance.onTarifaSubmit.subscribe({
      next:(tarifa:Tarifas)=>{
        this._tarifasService.postTarifaEspecial(tarifa).subscribe({
          next:()=>{
            this.promptMessage('Exito','Tarifa(s) Generada(s) con éxito')
            this._tarifasService.sendNotification(true);
            modalRef.close();        
          },
          error:()=>{
            this.promptMessage('Error','No se pudo guardar la tarifa intente de nuevo mas tarde')
          }
        })
      },
      error:()=>{

      }
    });
    modalRef.componentInstance.onAlertsEvent.subscribe({
      next:(value:Prompt)=>{
        this.promptMessage(value.title,value.message);
      }
    })
  }

  editTempRate(row:any){
    const modalref = this.modalService.open(TempRatesComponent,{size:'md',backdrop:'static'})
    modalref.componentInstance.tarifa=row
    modalref.componentInstance.tarifasArray = this.tarifaRackCompleto
    modalref.componentInstance.cuartosArray= this.cuartosArray;
    modalref.componentInstance.onTarifaSubmit.subscribe({
      next:(val:Tarifas)=>{
        if(val){
          this.updateTarifaBase(val);
          modalref.close();        
        }
      },
      error:(error:any)=>{
        this.promptMessage('Error',error);
      }
    });
  }

  editBaseRate(row:any){
    const modalref = this.modalService.open(ExpressRatesComponent,{size:'md',backdrop:'static'})
    modalref.componentInstance.tarifa=row
    modalref.componentInstance.tarifasArray = this.tarifaRackCompleto
    modalref.componentInstance.cuartosArray= this.cuartosArray;
    modalref.componentInstance.onTarifaSubmit.subscribe({
      next:(val:Tarifas)=>{
        if(val){
          this.updateTarifaBase(val);
          modalref.close();        
        }
      },
      error:(error:any)=>{
        this.promptMessage('Error',error);
      }
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
  }

}
