import {  Component, Input, OnDestroy, OnInit, ViewChild,ViewEncapsulation,ElementRef, ChangeDetectorRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar,NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';
import {  firstValueFrom, merge, of, Subscription } from 'rxjs';
import { catchError,   startWith,   switchMap,   tap } from 'rxjs/operators';

import { HttpClient } from "@angular/common/http";
import { map} from 'rxjs/operators'

import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import {DateTime} from 'luxon'
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { AuthService } from 'src/app/modules/auth';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/tools/date-picker.utils';
import { Disponibilidad } from 'src/app/models/disponibilidad.model';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { EstatusService } from 'src/app/pages/calendar/_services/estatus.service';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { Bloqueo } from '../_models/bloqueo.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { BloqueoService } from 'src/app/services/bloqueo.service';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LogService } from 'src/app/services/activity-logs.service';

type listaHabitaciones = {key:number;value:string}
type CheckboxState = {
  [key: string]: boolean;
};
@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './nvo-bloqueo.component.html',
  styleUrls: ['./nvo-bloqueo.component.scss'],
  encapsulation: ViewEncapsulation.None,


  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})


export class BloqueoReservaComponent implements  OnInit
{
  // @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  @ViewChild('exito') miniModal = null;
  @ViewChild('fechaIncorrecta') fechaIncorrecta = null;



  /**OPTIMIZED */
  bloqueoFormGroup:FormGroup

  llegada:string = new Date().toISOString();
  salida:string = new Date((new Date()).valueOf() + 1000*3600*24).toISOString();;
  llegadaDateFC = new FormControl();
  salidaDateFC = new FormControl();
  todayDate: Date=new Date();

  endDateEvent: string[] = [];
  endDate:Date = new Date((new Date()).valueOf() + 1000*3600*24);

  arrivalDateEvent: string[] = [];
  arrivalDate:Date = new Date();

  disponiblesIndexados:listaHabitaciones[]=[];
  cuarto:string = '';
  ocupadasSet = new Set();
  availavilityRooms:any[]=[]
  allSelected=false;
  bloqueosCompleteList:Bloqueo[]=[];

  checkboxState:CheckboxState = {
    // sinLlegadas: false,
    // sinSalidas: false,
    fueraDeServicio: false
  };

  isLoading:boolean=true
  closeResult:string;
  statusBloqueo:string


  idDelete:string;
  desdeDelete:string;
  hastaDelete:string;
  habitacionDelete:Array<string>;
  numeroDelete:Array<number>;
  selectedValues: any[] = []; // Variable to save checked options
  currentUser:string='root'

  /**Table */
  resultsLength = 0;

  displayedColumns: string[] = ['Habitacion', 'Cuarto', 'Desde', 'Estatus', 'Comentarios', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  @Input() codigoCuarto:Habitacion[]=[];
  @Input() estatusArray:Estatus[]=[];
  @Input() roomCodesComplete:any[]=[];

  @Output() honBloqueosToastEvent: EventEmitter<string> = new EventEmitter();
  @Output() honUpdateCalendar: EventEmitter<Bloqueo> = new EventEmitter();
  @Output() honToastEmit: EventEmitter<boolean> = new EventEmitter();

  
  
  
  @ViewChild('select') select: MatSelect;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
    constructor(
        public fb: FormBuilder,
        private modal: NgbActiveModal,
        private _disponibilidadService: DisponibilidadService,
        private changeDetector: ChangeDetectorRef,
        private _bloqueoService: BloqueoService,
        private _modalService:NgbModal,
        private _logsService: LogService,
        private _authService: AuthService
      )
    {
      this.currentUser = this._authService.getUserInfo().username
    }

    get tipoCuarto() { return this.bloqueoFormGroup.get('tipoCuarto') }
    get numeroHab() { return this.bloqueoFormGroup.get('numeroHab') }
    get isButtonEnabled(): boolean {
      return Object.values(this.checkboxState).some(value => value === true);
    }

  ngOnInit(): void {
    this.loadForm();

    // Subscribe to form control changes
    this.bloqueoFormGroup.get('numeroHab')!.valueChanges.subscribe(values => {
      this.selectedValues = values; // Update selectedValues when form control changes
      this.allSelected = this.disponiblesIndexados.length === this.selectedValues.length;
    });

    this.checkListaBloqueosIndexDB();
    const llegadaDate = new Date(this.llegada);
    const salidaDate = new Date(this.salida);

    this.llegadaDateFC.setValue(llegadaDate);
    this.salidaDateFC.setValue(salidaDate);
  }



loadForm() {
    this.bloqueoFormGroup = this.fb.group({
        'tipoCuarto': [ undefined, Validators.required ],
        'numeroHab' : [undefined,Validators.required],
        'comentarios': ['']
      });

}


async checkListaBloqueosIndexDB(){
  const bloqueosIndexDB:Bloqueo[] = await this._bloqueoService.readIndexDB("Bloqueos");

      /** Check if RoomsCode are on IndexDb */
      if(bloqueosIndexDB){
        this.bloqueosCompleteList = bloqueosIndexDB;
        this.dataSource.data = this.bloqueosCompleteList;
        this.isLoading = false;

    }else{
      try{
        this.bloqueosCompleteList = await firstValueFrom(this._bloqueoService.getAll());
        if (this.bloqueosCompleteList && this.bloqueosCompleteList.length) {
          this.dataSource.data = this.bloqueosCompleteList;
        } else {
          this.dataSource.data = [];
        }
        } catch (error) {
          console.error('Error loading data', error);
          this.dataSource.data = [];
        } finally {
          this.isLoading = false;
        }
        this.dataSource.data = this.bloqueosCompleteList;       
    }
}

isNumber(val:any): boolean { return typeof val === 'number'; }
isNotNumber(val:any): boolean { return typeof val !== 'number'; }

displayRooms(element:Bloqueo){
  return element.Cuarto.map(item=>{
    return item
  }).join('<br>')
}

displayFechas(element:any){
  const desde = element.Desde.split('T')[0]
  const hasta = element.Hasta.split('T')[0]

  return desde + '<br>' + hasta
}

  // Convert object to array of entries
  objectEntries(obj: Record<string, boolean>): { key: string; value: boolean }[] {
    const { sinLlegadas, sinSalidas, ...newObj } = obj;

    return Object.entries(newObj).map(([key, value]) => ({ key, value: value as boolean }));
  }
  

habValue($event:any){
  this.disponiblesIndexados=[]

  if($event.value === 1){
      this.cuarto='1'
    } else {
      this.cuarto = $event.value
    }

  this.getDisponibilidad(this.arrivalDate,this.endDate, this.cuarto, 1, '')

  }

  getDisponibilidad(intialDate:Date,endDate:Date, habitacion:string, stayNights:number, folio:string){

    this._disponibilidadService.getDisponibilidad(intialDate,endDate, habitacion, stayNights, folio)
    .subscribe({      
        next:(response)=>{

          // Convert response to a Set for quick lookup
          this.ocupadasSet = new Set(response);

          // Filter available rooms
          const habitacionesDisponibles = this.roomCodesComplete.filter(
            habitacion => !this.ocupadasSet.has(habitacion.Numero)
          );

          // Determine which rooms to index based on the selected room code (cuarto)
          const habitacionesParaIndexar = this.cuarto !== '1'
            ? habitacionesDisponibles.filter(habitacion => habitacion.Codigo === this.cuarto)
            : habitacionesDisponibles;

          // Map the filtered rooms to indexed objects
          this.disponiblesIndexados = habitacionesParaIndexar.map((habitacion, index) => ({
            key: index,
            value: habitacion.Numero
          }));

        },
        error:()=>{
        },
        complete:()=>{
          this.changeDetector.detectChanges();
        }}
    )
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
      this.bloqueoFormGroup.get('numeroHab')!.setValue(this.disponiblesIndexados.map(option => option.key));
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
      this.bloqueoFormGroup.get('numeroHab')!.setValue([]);
    }
  }

  optionClick() {
    const selectedOptions = this.select.options.filter((item: MatOption) => item.selected);
    this.selectedValues = selectedOptions.map((item: MatOption) => item.value);
    this.allSelected = this.disponiblesIndexados.length === this.selectedValues.length;
  }

  toggleCheckbox(type: string, event: any) {
    this.checkboxState[type] = event.checked;
  }

  edit(_id:string,
    desde:string,
    hasta:string,
    habitacion:string[],
    cuarto:number[],
    sinLlegadas:boolean,
    sinSalidas:boolean,
    fueraDeServicio:boolean,
    comentarios:string,
    ) {

//  this._bloqueoService.actualizaBloqueos(_id,desde,hasta,habitacion,cuarto,sinLlegadas,sinSalidas,fueraDeServicio,comentarios).subscribe((response)=>{
//    if(response.status==200){
//     this.honBloqueosToastEvent.emit("Bloqueo Actualizado Correctamente");
//    }else{
//     this.honBloqueosToastEvent.emit("Hubo un problema refresque la pagina eh intente nuevamente");
//    }
//  });

  }

  openDeleteModal(borrar:any,id:any,desde:any,hasta:any,habitacion:any,numero:any) {

    const modalRef = this._modalService.open(borrar,{ size: 'sm', backdrop:'static' });
    this.idDelete = id
    this.desdeDelete = desde
    this.hastaDelete = hasta
    this.habitacionDelete = habitacion
    this.numeroDelete = numero
  
    modalRef.result.then((result:any) => {
    this.closeResult = `Closed with: ${result}`;
    }, (reason:any) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    setTimeout(() => {
      modalRef.close('Close click');
    },4000)
  }

  borrar(_id:string,desde:string,hasta:string,habitacion:Array<string>,numero:Array<number>) {

    // const sb = this._bloqueoService.deleteBloqueo(_id).subscribe((response)=>{
    //    if(response.status==200)
    //      {
    //        this.statusBloqueo="Bloqueo Borrado Correctamente"
    //        this.openMini(this.miniModal)
 
    //       const sb = this._bloqueoService.liberaBloqueos(_id,desde,hasta,habitacion,numero).subscribe((response)=>{
    //          console.log("liberaDispo response",response)
    //        });
    //       }
    //      else
    //      {
    //        this.statusBloqueo="Hubo un problema al eliminar el bloqueo, Actualize la pagina y intente nuevamente"
    //        this.openMini(this.miniModal)
    //      }
    //    })
   }

   onCheckboxChange(bloqueo: any, key: string, checked: boolean) {
    bloqueo[key] = checked;
  }

   openMini(exito:any) {

    const modalRef = this._modalService.open(exito,{ size: 'sm', backdrop:'static' });
    modalRef.result.then((result) => {
    this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    setTimeout(() => {
      modalRef.close('Close click');
    },4000)
  }

  onSubmit() {

    if (this.bloqueoFormGroup.valid) {
      this.postBloqueo()  
    }
    else {
      console.log('invalid');
    }
  }

  postBloqueo(){

      // Generate the third object by mapping the keys to their corresponding values
      const cuartosPorBloquear = this.selectedValues.map(key => {
        // Find the value in the first object that matches the key
        const entry = this.disponiblesIndexados.find(item => item.key === key);
        return entry ? entry.value : ''; // Return the value or null if key not found
      });
  
      this._bloqueoService.postBloqueo(this.arrivalDate,this.endDate,this.cuarto,cuartosPorBloquear,this.checkboxState,this.bloqueoFormGroup.controls['comentarios'].value).subscribe({
        next:async (response)=>{

          if(response){
            const bloqueoPayload: Bloqueo = {
              Habitacion:this.cuarto,
              Cuarto:cuartosPorBloquear,
              Desde:this.arrivalDate,
              Hasta:this.endDate,
              bloqueoState:this.checkboxState,
              Comentarios:this.bloqueoFormGroup.controls['comentarios'].value,
              Completed:false,
              };
              const logRequests = this._logsService.logPostBloqueos('Bloqueo Created', this.currentUser, bloqueoPayload).pipe(
                catchError(error => {
                  // Handle error for individual log request if needed
                  console.error(`Failed to log parameters Change`, error);
                  return of(null); // Return a null observable to keep forkJoin working
                })
              )
      
            await firstValueFrom(logRequests); // Using firstValueFrom to handle the observable

              this.honUpdateCalendar.emit(bloqueoPayload);
              this.modal.close();
          }

          this.honToastEmit.emit(true);


        },
        error:(err)=>{

        },
        complete:()=>{

        }
      })
  }

 async cuartoValue(selected:boolean,value:any)
  {
    let index;
    let indexTipo;
    let codigo;

    // const sb = this.habitacionService.getHabitacionbyNumero(value)
    // .pipe(map(
    //   (responseData)=>{
    //     const postArray = []
    //     for(const key in responseData)
    //     {
    //       if(responseData.hasOwnProperty(key))
    //       postArray.push(responseData[key]);
    //     }
    //     return postArray
    //   }))
    //   .subscribe((cuartos)=>{
    //     codigo=(cuartos)
    //     if(selected==true)
    //     {
    //       this.numCuarto.push(value);
    //       this.tipodeCuartoFiltrados.push(codigo[0].Codigo)

    //     }else if(selected==false)
    //     {
    //       index=this.numCuarto.indexOf(value,0)
    //       this.numCuarto.splice(index,1)

    //       indexTipo = this.tipodeCuartoFiltrados.indexOf(codigo[0].Codigo,0)
    //       this.tipodeCuartoFiltrados.splice(indexTipo,1)
    //     }
    //   })
    // this.subscription.push(sb)
        //this.numCuarto=this.cuarto = $event.target.options[$event.target.options.selectedIndex].text;
  }

    addEventSalidaDate(eventType: string, event: any) {
        this.endDateEvent = []
        this.endDateEvent.push(`${eventType}: ${event.value}`);
        this.endDate = new Date(event.value!);
    }

    addEventLlegadaDate(eventType: string, event: any) {
        this.arrivalDateEvent = []
        this.arrivalDateEvent.push(`${eventType}: ${event.value}`);
        this.arrivalDate = new Date(event.value!);
    }
    // The filter function for disabling dates before 'llegada'
    salidaDateFilter = (date: Date | null): boolean => {
    //const llegadaDate = this.llegadaDateFC.value; // Disable before Llegadas 
        const llegadaDate = this.todayDate;

        if (!llegadaDate || !date) {
        return true; // Allow all dates if no llegadaDate is set or date is null
        }
        return date >= new Date(llegadaDate);
    };


    formatDateTo(date: string): string {
        return new Date(date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

    closeModal(){
    this.modal.close();
    }

  }
function observableOf(arg0: null): any {
  throw new Error('Function not implemented.');
}

