import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, Input, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { DEFAULT_HUESPED, Huesped } from 'src/app/models/huesped.model';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { preAsig } from 'src/app/_metronic/layout/components/header/reservations/nva-reserva/nva-reserva.component';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { TarifasRadioButton, Tarifas, TarifasDisponibles } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Foliador } from 'src/app/pages/calendar/_models/foliador.model';

import * as moment from 'moment';
import { Moment } from 'moment';
import { PropertiesChanged } from 'src/app/models/activity-log.model';
@Component({
  selector: 'app-modifica-reserva',
  templateUrl: './modifica.reserva.component.html',
  styleUrls: ['./modifica.reserva.component.scss'],
})
export class ModificaReservaComponent implements OnInit , AfterViewInit{

  constructor(
    private modal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService:NgbModal,
    private _disponibilidadService: DisponibilidadService,
    private changeDetector: ChangeDetectorRef,
    private cdr: ChangeDetectorRef
  ){
    // this._huespedService.currentHuesped$.subscribe({
    //     next:(reserva:Huesped)=>{
    //       this.currentHuesped = reserva
    //     }
    //   })
  }
  ocupadasSet = new Set();

  formGroup:FormGroup
  formGroup2:FormGroup
  currentDataFormGroup:FormGroup
  isLoading:boolean=false;
  accordionDisplay="";
  bandera:boolean=false;
  closeResult:string;
  mensajeAdultos:string=''
  mensajeNinos:string=''
  totalPorCuenta:number=0;

  /** Current Values */
  selectedRoom:any;
  tarifaSeleccionada:TarifasRadioButton[]=[];

  /** Styling */
  styleDisponibilidad:string='background-color:#99d284;'

  /** Models */
  roomCodes:Habitacion[]=[];
  mySet = new Set();
  ratesArrayComplete:Tarifas[]=[]
  infoRoomsAndCodes:any=[];
  availavilityCodeRooms:Habitacion[]=[]
  availavilityRooms:any[]=[]
  filterRatesAray:Tarifas[]=[]
  filterRatesbyRoomName:Tarifas[]=[]
  roomCodesComplete:Habitacion[]=[]
  preAsignadasArray:preAsig[]=[]


  estatusArray:Estatus[]=[];
  folios:Foliador[]=[];


  /** Dates */
  intialDateEvent: string[] = [];
  endDateEvent: string[] = [];
  intialDate:Date = new Date();
  endDate:any;
  intialDateFC = new FormControl(new Date());
  endDateFC = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));
  readonly minDate = new Date();
  minSalidaDate: Date;
  stayNights:number = 1;

  /** Personas */
  maxChildren:number=7;
  maxPeople:number=4;
  maxPeopleFlag:boolean=false;
  /** Max Adultos y niños */
  quantityNin:number=0;
  quantity:number=1;

  /** Flags */
  dropDownHabValueIndex:any
  variable:boolean[]=[]

  // Define your form controls
  llegadaDateFC = new FormControl();
  salidaDateFC = new FormControl();

  /**Table */
  displayedColumns: string[] = ['Tarifa', '$ Promedio x Noche', 'Total', 'Acciones'];
  dataSource = new MatTableDataSource<any>();
  displayedColumnsFooter: string[] = ['Habitacion', 'Numero'];

  //**AGREGAR HUESPED TEMPALTE */
  get nombre(){return this.currentDataFormGroup.get('nombre')}
  currentStatus:string='';
  currentFolio:Foliador;
  origenReserva:string='';
  noDisabledCheckIn:boolean;
  todayDate:Date = new Date();
  cuarto=''
  beforeChangesCustomer:PropertiesChanged;
  // closeResult: string;

  @Input() ratesArray:Tarifas[]=[];
  isCheckIn:boolean=false;
  @Input() rsvFromCalendar:boolean=false
  @Input() checkOut:string
  @Input() checkIn:string

  @Input() editHuesped:boolean=false;
  @Input() standardRatesArray:Tarifas[]=[]
  @Input() tempRatesArray:Tarifas[]=[]
  @Input() currentHuesped:Huesped=DEFAULT_HUESPED
  @Output() honUpdateHuesped: EventEmitter<any> = new EventEmitter();
  get inputs() {
    return this.formGroup.controls["nombreHabs"] as FormArray;
  }
  /** Subscription */

  async ngOnInit() {
  this.quantity = this.currentHuesped.adultos
  this.quantityNin = this.currentHuesped.ninos

    this.beforeChangesCustomer = { 
            folio:this.currentHuesped.folio,
            adultos:this.currentHuesped.adultos,
            ninos:this.currentHuesped.ninos,
            nombre:this.currentHuesped.nombre,
            salida:this.currentHuesped.salida,
            noches:this.currentHuesped.noches,
            tarifa:this.currentHuesped.tarifa,
            porPagar:this.currentHuesped.porPagar!,
            pendiente:this.currentHuesped.pendiente!,
            habitacion:this.currentHuesped.habitacion,
            telefono:this.currentHuesped.telefono,
            email:this.currentHuesped.email,
            numeroCuarto:this.currentHuesped.numeroCuarto
          }

          console.log("-------------------->",this.beforeChangesCustomer)

    const llegadaDate = new Date(this.currentHuesped.llegada);
    const salidaDate = new Date(this.currentHuesped.salida);

  
    this.llegadaDateFC.setValue(llegadaDate);
    this.salidaDateFC.setValue(salidaDate);
    
    this.preAsignadasArray.push({
      numero: this.currentHuesped.numeroCuarto,
      codigo: this.currentHuesped.habitacion,
      checked: true,
      disabled: true
    });

    const tarifaPrevia = this.ratesArrayComplete.map(item => {
      if(item.Tarifa === this.currentHuesped.tarifa){
        if(item.Habitacion.some(item => item === this.currentHuesped.habitacion)){
          this.tarifaRadioButton(this.currentHuesped.porPagar!, item, true, this.currentHuesped.habitacion! )
        }
      }
    });

      
    this.availavilityRooms = [this.roomCodesComplete.find(item => item.Codigo === this.currentHuesped.habitacion) ?? []];
  
    if (this.currentHuesped.origen === 'Check-In') {
      this.isCheckIn = true;
    }
  
    const startTime = new Date(this.currentHuesped.llegada);
    const endTime = new Date(this.currentHuesped.salida);

      // Convert Date objects to strings
    const startTimeStr = startTime.toISOString();
    const endTimeStr = endTime.toISOString();
  
    if (startTime && endTime) {
      this.cuarto = this.currentHuesped.habitacion;
      this.updateDatePicker(startTimeStr, endTimeStr);
      this.intialDate = startTime;
      this.endDate = endTime;
  
      const differenceInTime = this.endDate.getTime() - this.intialDate.getTime();
      this.stayNights = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
      this.getDisponibilidad(this.intialDate, this.endDate, this.cuarto, this.stayNights, "No Folio");
    }
  
    this.loadForm();
    this.formGroup.controls["habitacion"].setValue(this.currentHuesped.habitacion);
    this.formGroup.controls["habitacion"].setErrors(null);
  
    this.todaysDateComparer(this.intialDate);
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
  

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  updateDatePicker(newStartTime: string, newEndTime: string): void {
    const newInitialDate = new Date(newStartTime);
    const newEndDate = new Date(new Date(newEndTime).valueOf() - 1000 * 3600 * 24);
    this.intialDateFC.setValue(newInitialDate);
    this.endDateFC.setValue(newEndDate);
  }

  // Event handlers for date changes
addEventLlegadaDate(eventType: string, event: any) {
  this.intialDate = event.value 
  console.log(`${eventType}: ${event.value}`);
  // Add your custom logic here
}

addEventSalidaDate(eventType: string, event: any) {
  this.rsvFromCalendar=false

    this.endDateEvent = []
    this.endDateEvent.push(`${eventType}: ${event.value}`);
    this.endDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer(this.intialDate);

    this.formGroup.controls["habitacion"].setErrors({ invalid: true });

  // this.endDate = event.value;
  
  // console.log(`${eventType}: ${event.value}`);
  // Add your custom logic here
}


  onSubmit(){
    /**Check only one tarifa is selected per Room */
    if(this.formGroup.valid){
        if(this.currentDataFormGroup.valid){
            this.save();
        }else{
            this.findInvalidControlsRecursive(this.currentDataFormGroup);
        }
    }else if(this.formGroup.invalid){
      this.findInvalidControlsRecursive(this.formGroup);
    }
  }

  save(){
    const formCurrentData = this.currentDataFormGroup.value;
    let huesped : PropertiesChanged | null = null;
    let oldHuesped : PropertiesChanged

    // Assuming this.preAsignadasArray is defined somewhere in your component
    this.preAsignadasArray
    .filter(habitacion => habitacion.checked)  // Filter out only the checked items
    .forEach(habitacion => {
      const tarifa  = this.tarifaSeleccionada.find(obj =>
        obj.Habitacion.some(item => item === habitacion.codigo));

        let initialDate = DateTime.local().set({
            day:this.intialDate.getDate(),
            month:this.intialDate.getMonth()+1,
            year:this.intialDate.getFullYear(), 
            hour:parseInt(this.checkOut.split(":")[0]),
            minute:parseInt(this.checkOut.split(":")[1])
          }).toISO()
          const endDate = new Date(this.endDate);

          let endDateDateTime = DateTime.local().set({
            day:endDate.getDate(),
            month:endDate.getMonth()+1,
            year:endDate.getFullYear(), 
            hour:parseInt(this.checkIn.split(":")[0]),
            minute:parseInt(this.checkIn.split(":")[1])
          }).toISO()


          huesped = {
            folio:this.currentHuesped.folio,
            adultos:this.quantity,
            ninos:this.quantityNin,
            nombre:this.currentDataFormGroup.controls["nombre"].value,
            salida:endDateDateTime ?? this.endDate._d.toISOString(),
            noches:this.stayNights,
            tarifa:tarifa === undefined ? 'Tarifa Base' : tarifa.Tarifa,
            porPagar:this.totalPorCuenta === 0 ? this.currentHuesped.porPagar! : this.totalPorCuenta,
            pendiente:this.totalPorCuenta === 0 ? this.currentHuesped.porPagar! : this.totalPorCuenta,
            habitacion:habitacion.codigo,
            telefono:formCurrentData.telefono,
            email:formCurrentData.email,
            numeroCuarto:habitacion.numero,     
          }

          // this.huespedInformation.push({ huesped: huesped, beforeChanges:this.beforeChangesCustomer})
    });
    if(huesped){
      this.honUpdateHuesped.emit({ huesped: huesped, beforeChanges:this.beforeChangesCustomer});
    }

  }

  checkAvaibility(codigoCuarto:string){
    if(codigoCuarto!='1'){
      const dispo = this.availavilityRooms.find(item=> item.Codigo === codigoCuarto);
    
      if(dispo){
        this.setStep(1)
        return false;
      }else{
        // this.setStep(0);
        return true
      }
    }else{
      if(this.availavilityRooms.length===0){
        // this.setStep(0);
        return true
      }else{
        this.setStep(1)
        return false
      }
    }
    
  }

  todaysDateComparer(initialDate:Date){
    //Disable CheckIn if the sTart Day is not today
    if(initialDate.setHours(0,0,0,0) === this.todayDate.setHours(0,0,0,0)) {
      this.noDisabledCheckIn=true
    }     
    else{
      this.noDisabledCheckIn=false
    }
}

  loadForm(){
    this.formGroup = this.fb.group({
      adultos:[{value:this.currentHuesped.adultos, disabled:true }, Validators.required],
      ninos:[{value:this.currentHuesped.ninos,disabled:true}, Validators.required],
      habitacion:['',Validators.required],
      checkbox:[{value:false, disabled:true},Validators.required],
    });

    this.currentDataFormGroup = this.fb.group({
        nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
        email: ['', Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
        telefono: ['', Validators.compose([Validators.nullValidator,Validators.pattern('[0-9]+'),Validators.minLength(10),Validators.maxLength(14)])],
    })
    this.formGroup2 = this.fb.group({
      checkbox:[false,Validators.required],
    })

    this.currentDataFormGroup.controls["nombre"].patchValue(this.currentHuesped.nombre);
    this.currentDataFormGroup.controls["email"].patchValue(this.currentHuesped.email);
    this.currentDataFormGroup.controls["telefono"].patchValue(this.currentHuesped.telefono);


  }

  formatDateTo(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-MX', { // Use the appropriate locale and options for your needs
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }


  tarifaRadioButton(totalTarifa:number,tarifas:Tarifas, event:any, codigo:string){
    this.totalPorCuenta = totalTarifa
    let checkedStatus
    if(event.hasOwnProperty('source') ){
      checkedStatus = event.source.checked
    }else{
      checkedStatus = event; 
    }
    const tarifa = tarifas

    //Uncheck all checkboxes that are not for the roomCode
    this.preAsignadasArray.map((item)=>{
      if(item.codigo !== codigo){
        item.checked=false;
        item.disabled=true;
      }else{
        item.disabled=false;
      }
    });

      if(this.tarifaSeleccionada.length > 0){
        const index  = this.tarifaSeleccionada.findIndex(obj =>
          obj.Habitacion.some(item => item === codigo));

          if(index != -1){
            this.tarifaSeleccionada[index].checked = checkedStatus
            this.tarifaSeleccionada.splice(index,1);
            this.tarifaSeleccionada.push({...tarifa,checked:checkedStatus})
          }else{
          }if(index === -1){
            this.tarifaSeleccionada.push({...tarifa,checked:checkedStatus})
          }
      }
    else{
      this.tarifaSeleccionada.push({...tarifa,checked:checkedStatus})
     }     
  }

  preAsignar(numero:any,codigo:string,checked:boolean,disabled:boolean){
    if(this.preAsignadasArray.length >= 0){
      const index = this.preAsignadasArray.findIndex((item) => item.numero === numero)
      if(index != -1){
        this.preAsignadasArray.forEach((item,index)=>{
            item.checked = false;
            item.disabled = false;
        });
        this.preAsignadasArray[index].checked = checked
        this.preAsignadasArray[index].disabled = disabled
      }else{
        this.preAsignadasArray.push({numero,codigo,checked, disabled})
      }
    }else{
      this.preAsignadasArray.push({numero,codigo,checked, disabled})
    }
}

ratesTotalCalc(tarifa: Tarifas, estanciaPorNoche: number, codigosCuarto = this.cuarto, tarifaPromedio = false) {
  const adultos = this.quantity;
  const ninos = this.quantityNin;
  let tarifaTotal = 0;

  const applyRate = (item: TarifasDisponibles) => {
    let rate = 0;
    switch (adultos) {
      case 1:
        rate = item.Tarifa_1;
        break;
      case 2:
        rate = item.Tarifa_2;
        break;
      case 3:
        rate = item.Tarifa_3;
        break;
      default:
        rate = item.Tarifa_3;
    }
    tarifaTotal += rate * adultos;
    if (ninos !== 0) {
      tarifaTotal += item.Tarifa_N * ninos;
    }
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

  for (let start = new Date(this.intialDate); start < this.endDate; start.setDate(start.getDate() + 1)) {
    const day = start.getDay();

    if (tarifa.Tarifa === 'Tarifa Base') {
      const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto, start);
      if (tarifaTemporada !== 0) {
        tarifaTotal += tarifaTemporada;
      } else {
        tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start);
      }
    } else if (tarifa.Tarifa === 'Tarifa De Temporada') {
      if (tarifa.Estado && this.isInSeason(tarifa, start)) {
        const validDay = tarifa.TarifasActivas.some(item => 
          item.Dias?.some(x => x.name === dayNames[day] && x.checked && item.Activa)
        );
        if (validDay) {
          tarifa.TarifasActivas.forEach(applyRate);
        } else {
          tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start);
        }
      } else {
        tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start);
      }
    } else { // Tarifas especiales
      if (tarifa.Estado && this.isInSeason(tarifa, start)) {
        const validDay = tarifa.TarifasActivas.some(item => 
          item.Dias?.some(x => x.name === dayNames[day] && x.checked && item.Activa)
        );
        if (validDay) {
          tarifa.TarifasActivas.forEach(applyRate);
        } else {
          const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto, start);
          if (tarifaTemporada !== 0) {
            tarifaTotal += tarifaTemporada;
          } else {
            tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start);
          }
        }
      } else {
        tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start);
      }
    }
  }

  return tarifaPromedio ? Math.ceil(tarifaTotal / this.stayNights) : tarifaTotal;
}


retriveBaseRatePrice(codigosCuarto: string, checkDay: Date) {
  const tarifaBase = this.standardRatesArray.find(obj => obj.Habitacion.includes(codigosCuarto));
  const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto, checkDay);

  if (tarifaTemporada !== 0) {
    return Math.ceil(tarifaTemporada);
  }

  let tarifaTotal = 0;
  if (tarifaBase) {
    tarifaBase.TarifasActivas.forEach(item => {
      let rate = 0;
      switch (this.quantity) {
        case 1:
          rate = item.Tarifa_1;
          break;
        case 2:
          rate = item.Tarifa_2;
          break;
        case 3:
          rate = item.Tarifa_3;
          break;
        default:
          rate = item.Tarifa_3;
      }
      tarifaTotal += rate * this.quantity;
      if (this.quantityNin !== 0) {
        tarifaTotal += item.Tarifa_N * this.quantityNin;
      }
    });
  }
  return Math.ceil(tarifaTotal);
}

checkIfTempRateAvaible(codigoCuarto: string, fecha: Date) {
  const tarifaTemporada = this.tempRatesArray.find(obj => obj.Habitacion.includes(codigoCuarto));
  if (!tarifaTemporada || !this.isInSeason(tarifaTemporada, fecha)) return 0;

  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const day = fecha.getDay();
  const validDay = tarifaTemporada.TarifasActivas[0]?.Dias?.some(x => x.name === dayNames[day] && x.checked);

  if (validDay && tarifaTemporada.Estado) {
    let tarifaTotal = 0;
    tarifaTemporada.TarifasActivas.forEach(item => {
      let rate = 0;
      switch (this.quantity) {
        case 1:
          rate = item.Tarifa_1;
          break;
        case 2:
          rate = item.Tarifa_2;
          break;
        case 3:
          rate = item.Tarifa_3;
          break;
        default:
          rate = item.Tarifa_3;
      }
      tarifaTotal += rate * this.quantity;
      if (this.quantityNin !== 0) {
        tarifaTotal += item.Tarifa_N * this.quantityNin;
      }
    });
    return Math.ceil(tarifaTotal);
  }
  return 0;
}


isInSeason(tarifa: any, checkDate: Date): boolean {
  const startDate = new Date(tarifa.Llegada);
  const endDate = new Date(tarifa.Salida);

  return checkDate >= startDate && checkDate < endDate;
}



  buscaDispo(habitacion:any){
    // No Option Selected
    this.editHuesped=false;
    this.resetDispo();

    if(habitacion === '0'){
      this.setStep(0);
      return
    }
    const folio = 'No Folio'
    this.formGroup.controls['checkbox'].setValue(false);
    this.isLoading=true;
    this.selectedRoom = habitacion
    
    if(habitacion === '1'){
      this.cuarto=habitacion
    }else {
      this.cuarto=habitacion.Codigo
    }

    this.filterRates();


    this.maxPeopleCheck(habitacion);

    if(this.selectedRoom === '1'){
      this.bandera=true
      this.dropDownHabValueIndex=1
    }else{
      this.bandera=false
      this.dropDownHabValueIndex=''
    }

    this.getDisponibilidad(this.intialDate,this.endDate, habitacion, this.stayNights, folio)
  }

  revisaCapacidad(codigoCuarto:string){
    const hab = this.roomCodesComplete.find(item=>
      item.Codigo === codigoCuarto
    );

    if(hab){
      if(hab.Adultos < this.quantity || hab?.Ninos<this.quantityNin){
        if(this.quantity > hab.Adultos ){
          this.mensajeAdultos='El número de Adultos seleccionado exede la cantidad maxima de personas permitida para ste tipo de habitacion'+ '<br>';
        }
        if(this.quantityNin > hab?.Ninos){
          this.mensajeNinos='El número de Niños seleccionado exede la cantidad maxima de personas permitida para ste tipo de habitacion'
        }
        return true;
      }else{
        this.mensajeAdultos='';
        this.mensajeNinos=''
        return false
      }
    }
    return false
  }

  roomRates(minihabs:string){
    let availbleRates = this.ratesArrayComplete.filter((item) => item.Estado === true); 

    availbleRates  = availbleRates.filter(obj =>
      obj.Habitacion.some(item => item === minihabs));
    
    availbleRates = availbleRates.filter(item => item.Tarifa !== 'Tarifa De Temporada')
                                    // Add date filtering
    availbleRates = availbleRates.filter(item =>
      new Date(item.Llegada) <= this.endDate && new Date(item.Salida) >= this.intialDate
    );
    
    return availbleRates
  }

  getDisponibilidad(intialDate:Date,endDate:Date, habitacion:string, stayNights:number, folio:string){
    this._disponibilidadService.getDisponibilidad(intialDate,endDate, habitacion, stayNights, folio)
    .subscribe({      
        next:(response)=>{

          this.ocupadasSet = new Set(response);
          // Take out current huesped room from the no avaible rooms
          this.ocupadasSet.delete(this.currentHuesped.numeroCuarto);
          // Filtrar las habitaciones disponibles
          const habitacionesDisponibles = this.roomCodesComplete.filter(habitacion => !this.ocupadasSet.has(habitacion.Numero));

          // Paso 1: Crear el array preAsignadasArray
          this.preAsignadasArray = habitacionesDisponibles.map(item => ({
            numero: item.Numero,
            codigo: item.Codigo,
            checked: false,
            disabled: true
          }));
          this.preAsignadasArray.map(item=>{
            if(item.numero === this.currentHuesped.numeroCuarto){
              item.checked = true
            }
          })

          // Paso 2: Filtrar para obtener solo un objeto único por cada 'Codigo'
          if(this.cuarto === '1'){
            const habitacionesUnicas:any = {};
            habitacionesDisponibles.forEach(habitacion => {
            if (!habitacionesUnicas[habitacion.Codigo]) {
              habitacionesUnicas[habitacion.Codigo] = habitacion;
            }
          });
          const habitacionesUnicasArray = Object.values(habitacionesUnicas);
          this.availavilityRooms = [...habitacionesUnicasArray]
          }else{
            this.availavilityRooms = [...habitacionesDisponibles];
          }

        },
        error:()=>{
        },
        complete:()=>{
          this.accordionDisplay=''
          this.isLoading=false;
          this.changeDetector.detectChanges();

        }}
    )
  }

  filterRates(){
                if(this.ratesArray){
                       this.filterRatesAray = this.ratesArray.filter((val) => 
                         new Date(val.Llegada).getTime() <= this.intialDate.getTime() && new Date(val.Salida).getTime() >= this.endDate.getTime() )
                } 
        
                /**Comparador de Estancias Tarifario */
                this.filterRatesAray = this.filterRatesAray.filter(x=>{
                  var estanciaMinima = x.EstanciaMinima
                  var estanciaMaxima = x.EstanciaMaxima
                  if(x.EstanciaMaxima==0){
                    estanciaMaxima=999
                  }
                  return (this.stayNights >= estanciaMinima &&  this.stayNights <= estanciaMaxima  )
                })
    
                const fromDate = DateTime.fromObject({ 
                                                      year: this.intialDate.getFullYear(), 
                                                      month: this.intialDate.getMonth(), 
                                                      day: this.intialDate.getDate()
                                                    })
                /**Elimina Tarifas que no apliquen para el dia de llegada */
                for(let i=0;i<this.filterRatesAray.length;i++){
                  if(this.filterRatesAray[i].Tarifa!='Tarifa Estandar'){
                    
                    var timeLlegada = DateTime.fromObject({ 
                                                            year: new Date(this.filterRatesAray[i].Llegada).getFullYear(), 
                                                            month: new Date(this.filterRatesAray[i].Llegada).getMonth(), 
                                                            day: new Date(this.filterRatesAray[i].Llegada).getDate()
                                                          })
                    
                for(;fromDate>=timeLlegada;timeLlegada=timeLlegada.plus({ days: 1 })){
                      if(fromDate.hasSame(timeLlegada, 'day') && fromDate.hasSame(timeLlegada, 'year') && fromDate.hasSame(timeLlegada, 'month')){
    
                        var diaDeLlegada = fromDate.setLocale("es").weekdayShort
                        var diaDeLlegadaMayus = diaDeLlegada!.charAt(0).toUpperCase() + diaDeLlegada!.slice(1);
                        
                        for(let x=0;x<this.filterRatesAray[i].Dias!.length;x++){
                          if(this.filterRatesAray[i].Dias![x].name==diaDeLlegadaMayus && this.filterRatesAray[i].Dias![x].checked==false){
                            this.filterRatesAray = this.filterRatesAray.filter( obj => obj.Tarifa !== this.filterRatesAray[i].Tarifa);
                            break;
                          }
                        }
                      }
                    }
                  }

                  this.filterRatesAray
                  /** */
               }   
  }

  maxPeopleCheck(habitacion:any){
    var maxPeopleFlag
    /**Revision de Maximo de Personas */

    if(habitacion==='1'){
      maxPeopleFlag = Math.max.apply(Math, this.roomCodes.map(function(o) { return o.Adultos; }))
      if(this.quantity>maxPeopleFlag){
        this.maxPeopleFlag=true
        this.styleDisponibilidad='background-color:#fa6d7c;'
      }else{
        this.styleDisponibilidad='background-color:#99d284;'
        this.maxPeopleFlag=false

      }
    }else{

      this.selectedRoom = this.roomCodes.filter(d=>{
        return(d.Codigo==habitacion.Codigo)
      })
      maxPeopleFlag = Math.max.apply(Math, this.selectedRoom.map((o:any) => { return o.Adultos; }))
      
      if(this.quantity>maxPeopleFlag){
        this.maxPeopleFlag=true
        this.styleDisponibilidad='background-color:#fa6d7c;'
      }else{
        this.styleDisponibilidad='background-color:#99d284;'
        this.maxPeopleFlag=false
      }
    }
  }

  resetDispo(){
    this.editHuesped = false;
    this.preAsignadasArray=[];
    this.accordionDisplay="display:none"
    this.cuarto=''
    this.availavilityCodeRooms = [];
    this.availavilityRooms = [];
    this.mySet.clear;
    this.formGroup.patchValue({['habitacion']: 0});
  }

  addEventIntialDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.intialDateEvent = []
    this.intialDateEvent.push(`${type}: ${event.value}`);
    this.intialDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer(this.intialDate);

  }

  addEventEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.endDateEvent = []
    this.endDateEvent.push(`${type}: ${event.value}`);
    this.endDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer(this.endDate);
  }

  getRooms(){
    this.mySet.forEach((element)=>{
      this.roomCodes.forEach((roomsElemts)=>{
        if(roomsElemts.Numero === element){
          return roomsElemts.Numero
        }
      })
    })
  }

  /** Mat-expansioln-Pane [Acordion] */
  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  
  nextStep() {
    this.step++;
  }
  
  prevStep() {
    this.step--;
  }

  /** Plus and Minus Custom Buttons */
  plus()
  {
    if(this.quantity<8){
      this.quantity++;
    }
    this.resetDispo();
  }
  minus(){
    if(this.quantity>1){
    this.quantity--;
    }else{    
      this.quantity
    }    
  this.resetDispo();
  }
  plusNin()
  {
    if(this.quantityNin<7){
      this.quantityNin++;
    }
    this.resetDispo();

  }
  minusNin()
  {
    if(this.quantityNin>0){
    this.quantityNin--;
    }else{
    this.quantityNin
    }
    this.resetDispo();

  }
  /** End Custom Plus Minus Button */

  isControlValid(controlName: string): boolean {
    const control = this.currentDataFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.currentDataFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation:any, controlName:string): boolean {
    const control = this.currentDataFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
  isControlTouched(controlName:string): boolean {
    const control = this.currentDataFormGroup.controls[controlName];
    return control.dirty || control.touched;
  }
  //Second FormGroup
  isControlTouchedFirst(controlName:string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  isControlValidFirst(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalidFirst(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    console.log(this.formGroup.controls);
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorFirst(validation:any, controlName:string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }


  closeModal()
  {
    this.modal.close();
  }



  setEstatus(value:any) {

    if(this.estatusArray){
      this.currentStatus = this.estatusArray.find(item=> item.id === value)?.estatus!;
    }

    if(value===1){
      this.currentFolio=this.folios[2]
      this.origenReserva='Walk-In'
    }
    else if(value===2){
    this.currentFolio=this.folios[0]
    this.origenReserva='Reserva'}
    else if(value === 5){
      this.currentFolio=this.folios[1]
      this.origenReserva='Uso Interno'
    }else if(value === 7){
      this.currentFolio=this.folios[3]
      this.origenReserva='Reserva Temporal'
    }
    this.onSubmit();
  }

  /**
   * 
   * @returns This function disables reservation button if user has not selected any room
   */
  preAsigCheck(){
    const found = this.preAsignadasArray.findIndex((item)=> item.checked === true)
    if(found != -1){
      return false
    }else{
      return true
    }
  }

  tarifaSeleccionadaCheck(){
    const found = this.tarifaSeleccionada.findIndex((item)=> item.checked === true)
    if(found != -1){
      return false
    }else{
      return true
    }
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

    //CheckEstatus Controls
    public findInvalidControlsRecursive(formToInvestigate:FormGroup):string[] {
      var invalidControls:string[] = [];
      let recursiveFunc = (form:FormGroup) => {
        Object.keys(form.controls).forEach(field => {
          const control = form.get(field);
          if (control?.invalid) invalidControls.push(field);
          if (control instanceof FormGroup) {
            recursiveFunc(control);
          }
        });
      }
      recursiveFunc(formToInvestigate);
      return invalidControls;
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

