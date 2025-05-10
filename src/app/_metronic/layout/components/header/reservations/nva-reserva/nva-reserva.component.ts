/* eslint-disable @angular-eslint/no-output-on-prefix */
import {  AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Tarifas, TarifasRadioButton } from 'src/app/models/tarifas';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/tools/date-picker.utils';
import { Huesped } from 'src/app/models/huesped.model';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Foliador } from 'src/app/pages/calendar/_models/foliador.model';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { DateTime } from 'luxon'; 
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import { MatSelect } from '@angular/material/select';
import { TarifasService } from 'src/app/services/tarifas.service';

import {animate, state, style, transition, trigger} from '@angular/animations';

export interface preAsig {
  numero:any,
  codigo:string,
  checked:boolean,
  disabled:boolean
}

export interface Period {
  from: string;
  to: string;
}

@Component({
  selector: 'app-nva-reserv-modal',
  templateUrl: './nva-reserva.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrls: ['./nva-reserva.component.scss'],
  encapsulation: ViewEncapsulation.None,


  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})


export class NvaReservaComponent implements  OnInit, OnDestroy, AfterViewInit
{
  constructor(
    private modal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService:NgbModal,
    private _disponibilidadService: DisponibilidadService,
    private changeDetector: ChangeDetectorRef,
    private _indexDbCheck: IndexDBCheckingService,
    private _tarifasService: TarifasService
  ){

  }

  formGroup:FormGroup
  formGroup2:FormGroup
  isLoading:boolean=false;
  accordionDisplay="";
  bandera:boolean=false;
  closeResult:string;
  mensajeCapacidad:string=''
  totalPorCuenta:number=0;

  /** Current Values */
  selectedRoom:any;
  tarifaSeleccionada:TarifasRadioButton[]=[];

  /** Styling */
  styleDisponibilidad:string='background-color:#99d284;'

  /** Models */
  // ocupadasSet = new Set();
  mySetAvaible = new Set();

  @Input() ratesArray:Tarifas[]=[];
  ratesArrayComplete:Tarifas[]=[]
  infoRoomsAndCodes:any=[];
  availavilityCodeRooms:Habitacion[]=[]
  availavilityRooms:any[]=[]
  filterRatesAray:Tarifas[]=[]
  filterRatesbyRoomName:Tarifas[]=[]
  @Input() roomCodesComplete:Habitacion[]=[]
  preAsignadasArray:preAsig[]=[]
  currentAvaibleRates: Tarifas[] = [];
  currentOverlapRateDays:any[]=[];

  estatusArray:Estatus[]=[];
  folios:Foliador[]=[];
  huespedInformation:Huesped[]=[];

  /** Dates */
  intialDateEvent: string[] = [];
  endDateEvent: string[] = [];
  intialDate:Date = new Date();
  endDate:Date = new Date((new Date()).valueOf() + 1000*3600*24);
  intialDateFC = new FormControl(new Date());
  endDateFC = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));

    // Define the date filter function
    dateFilter = (d: Date | null): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Clear time part of today's date
      return d ? d >= today : false; // Disable dates before today
    };

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


  /**Table */
  displayedColumns: string[] = ['Tarifa', '$ Promedio x Noche', 'Total', 'Acciones'];
  isExpansionDetailRow = (index: number, row: any) => row === this.expandedElement;
  displayedInnerColumns: string[] = ['tarifa', 'fecha', 'tarifaTotal'];


  dataSource = new MatTableDataSource<any>();
  displayedColumnsFooter: string[] = ['Habitacion', 'Numero'];

  //**AGREGAR HUESPED TEMPALTE */
  get nombre(){return this.formGroup.get('nombre')}
  currentStatus:string='';
  currentFolio:Foliador;
  origenReserva:string='Recepcion';
  noDisabledCheckIn:boolean=true;
  todayDate:Date = new Date();
  // closeResult: string;

  // Expandable Row
  expandedElement: any | null = null;
  // isExpanded = (element: any) => this.expandedElement === element;

  @Input() standardRatesArray:Tarifas[]=[]
  @Input() tempRatesArray:Tarifas[]=[]
  @Input() checkOut:string
  @Input() checkIn:string
  @Input() zona:string='America/Mexico_City'
  @Input() parametros: Parametros

  //On Calendar Trigger DefaultValue
  @Input() numeroCuarto:string=''
  @Input() rsvFromCalendar:boolean=false
  @Input() startTime:string=''
  @Input() endTime:string=''
  @Input() cuarto:string=''
  @Input() roomCodes:Habitacion[]=[];
  


  @Output() onNvaReserva: EventEmitter<Huesped[]> = new EventEmitter();
  @Output() onGetDisponibilidad: EventEmitter<any> = new EventEmitter();

  get inputs() {
    return this.formGroup.controls["nombreHabs"] as FormArray;
  }
  /** Subscription */

  async ngOnInit() {
    this.loadForm();

    if(this.startTime !== '' && this.endTime !== ''){
      
      this.updateDatePicker(this.startTime,this.endTime);
      this.intialDate = new Date(this.startTime);
      this.endDate = new Date(this.endTime);

      //Minus 1 day 
      // Check if endDate is different from intialDate
      if (this.endDate.getTime() !== this.intialDate.getTime()) {
        this.todaysDateComparer(this.intialDate);

        // Subtract one day from endDate [Not Needed since a fix was added on calendar component, ]
        // Pending response from syncfusion to see why the endDate is always one day later than selected
        const adjustedEndDate = new Date(this.endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate());

        // Ensure adjustedEndDate is not equal to intialDate
        if (adjustedEndDate.getTime() !== this.intialDate.getTime()) {
          this.endDate = adjustedEndDate;
        }
      }

      let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

      this.stayNights = Math.floor(Difference_In_Time / (1000 * 3600 * 24));

      if(this.cuarto){
        this.formGroup.patchValue({ habitacion: this.cuarto });
      }

      this.getDisponibilidad(this.intialDate, this.endDate, this.cuarto, this.stayNights, "No Folio", this.cuarto);
    }  
  }

    // Method to manually set a FormControl to valid
    setFormControlToValid(controlName: string) {
      const control = this.formGroup.get(controlName);
      if (control) {
        control.setErrors(null); // Clear all errors
        control.markAsTouched(); // Mark the control as touched if needed
        control.updateValueAndValidity(); // Update its validity status
      }
    }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  updateDatePicker(newStartTime: string, newEndTime: string): void {
    const newInitialDate = new Date(newStartTime);
    const newEndDate = new Date(new Date(newEndTime));
    this.intialDateFC.setValue(newInitialDate);
    this.endDateFC.setValue(newEndDate);
  }

  onSubmit(){
    /**Check only one tarifa is selected per Room */
    if(this.formGroup.valid){
      this.save();
    }else if(this.formGroup.invalid)
    {
      this.findInvalidControlsRecursive(this.formGroup);
    }
  }

  async save(){
    const formData = this.formGroup.value;
    
    const foliosArray = await this._indexDbCheck.loadFoliador(true);
    const reservasFolio = foliosArray.find(item => item.Letra === this.currentFolio.Letra)!
    // Convert the current Folio to an integer
    let currentFolioValue = parseInt(reservasFolio.Folio, 10);

    // Loop through the filtered and checked items
    this.preAsignadasArray
      .filter(habitacion => habitacion.checked)  // Filter out only the checked items
      .forEach((habitacion, index) => {

        // Find the first matching tarifa in `tarifaSeleccionada`
        const tarifa = this.tarifaSeleccionada.find(obj => 
          obj.Habitacion.includes(habitacion.codigo)
        );

        // Use the found `tarifa` to search in `ratesArrayComplete`
        const tarifaSeleccionada = tarifa 
          ? this.ratesArrayComplete.find(obj => 
              obj.Tarifa === tarifa.Tarifa && obj.Habitacion.includes(habitacion.codigo)
            )
          : undefined;

        if (!tarifaSeleccionada) {
          this.promptMessage('Error', 'No se pudo guardar la reservacion intente con otra tarifa');
          return;
        }

        let initialDate = DateTime.local().setZone(this.zona).set({
            day: this.intialDate.getDate(),
            month: this.intialDate.getMonth() + 1,
            year: this.intialDate.getFullYear(), 
            hour: parseInt(this.checkOut.split(":")[0]),
            minute: parseInt(this.checkOut.split(":")[1])
          }).toISO();

        let endDate = DateTime.local().setZone(this.zona).set({
            day: this.endDate.getDate(),
            month: this.endDate.getMonth() + 1,
            year: this.endDate.getFullYear(), 
            hour: parseInt(this.checkIn.split(":")[0]),
            minute: parseInt(this.checkIn.split(":")[1])
          }).toISO();

        // Use the current value for the first iteration and increment after
        const folio = this.currentFolio.Letra + currentFolioValue;

        const desgloseEdoCuenta = this._tarifasService.ratesTotalCalc(
          tarifaSeleccionada,
          this.standardRatesArray,
          this.tempRatesArray,
          habitacion.codigo,
          this.quantity,
          this.quantityNin,
          new Date(initialDate ?? this.intialDate.toISOString()),
          new Date(endDate ?? this.endDate.toISOString()),
          this.stayNights,
          false,
          false,
          true
        ) ?? [];

        // Construct huesped object
        const huesped = {
          folio: folio,  // Use the generated folio
          adultos: this.quantity,
          ninos: this.quantityNin,
          nombre: formData.nombre,
          estatus: this.currentStatus,
          llegada: initialDate ?? this.intialDate.toISOString(),
          salida: endDate ?? this.endDate.toISOString(),
          noches: this.stayNights,
          tarifa: tarifaSeleccionada,
          porPagar: this.totalPorCuenta,
          pendiente: this.totalPorCuenta,
          origen: this.origenReserva,
          habitacion: habitacion.codigo,
          telefono: formData.telefono,
          email: formData.email,
          numeroDeCuarto: habitacion.numero,
          creada: new Date().toISOString(),
          motivo: '',
          fechaNacimiento: '',
          trabajaEn: '',
          tipoDeID: '',
          numeroDeID: '',
          direccion: '',
          pais: '',
          ciudad: '',
          codigoPostal: '',
          lenguaje: '',
          numeroCuarto: habitacion.numero,
          tipoHuesped: '',
          notas: '',
          vip: '',
          ID_Socio: 0,
          estatus_Ama_De_Llaves: 'LIMPIA', 
          desgloseEdoCuenta:desgloseEdoCuenta
        };

        // Push the generated huesped information to the array
        this.huespedInformation.push(huesped);

        // Increment the folio for the next iteration
        currentFolioValue += 1;
      });


    this.onNvaReserva.emit(this.huespedInformation);
    
  }

  checkAvaibility(codigoCuarto:string){
    if(codigoCuarto!=='1'){
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
      adultos: [{ value: 1, disabled: true }, Validators.required],
      ninos: [{ value: 0, disabled: true }, Validators.required],
      checkbox: [{ value: false, disabled: true }, Validators.required],
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: ['', Validators.compose([
        Validators.required,  // <-- Make email required
        Validators.email,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
        Validators.minLength(3),
        Validators.maxLength(50)
      ])],
      telefono: ['', Validators.compose([
        Validators.required,  // <-- Make telefono required
        Validators.pattern('[0-9]+'),
        Validators.minLength(10),
        Validators.maxLength(14)
      ])],
      searchTerm: ['', Validators.maxLength(100)],
      habitacion: ['', Validators.required]
    });
    
    this.formGroup2 = this.fb.group({
      checkbox:[false,Validators.required],
    })
  }


  tarifaRadioButton(totalTarifa:number,tarifas:Tarifas, event:any, codigo:string){
    this.totalPorCuenta = totalTarifa
    const checkedStatus = event.source.checked
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
        this.preAsignadasArray[index].checked = checked
        this.preAsignadasArray[index].disabled = disabled
      }else{
        this.preAsignadasArray.push({numero,codigo,checked, disabled})
      }
    }else{
      this.preAsignadasArray.push({numero,codigo,checked, disabled})
    }
    this.formGroup.controls
}


ratesToCalc(tarifa: Tarifas, onlyBreakDown:boolean = false, codigosCuarto = this.cuarto, tarifaPromedio = false){

  if(onlyBreakDown){
    const result = this._tarifasService.ratesTotalCalc(
      tarifa,
      this.standardRatesArray,
      this.tempRatesArray,
      codigosCuarto,
      this.quantity,
      this.quantityNin,
      this.intialDate,
      this.endDate,
      this.stayNights,
      tarifaPromedio,
      false,
      true
    ) ?? [];

    return result
  }else {
    const rate = this._tarifasService.ratesTotalCalc(
      tarifa,
      this.standardRatesArray,
      this.tempRatesArray,
      codigosCuarto,
      this.quantity,
      this.quantityNin,
      this.intialDate,
      this.endDate,
      this.stayNights,
      tarifaPromedio,
      false,
    );

    // Ensure it always returns a number
    return Array.isArray(rate) ? rate[0]?.tarifaTotal ?? 0 : rate ?? 0;
  }
}

getTooltipText(element: any): string {
  const rates = this.ratesToCalc(element, true); // Get the array of objects
  return rates.map((rate:any) => `${rate.tarifa} - ${rate.fecha}: $${rate.tarifaTotal}`).join('\n');
}

  getDisponibilidad(intialDate:Date,endDate:Date, habitacion:string, stayNights:number, folio:string, cuarto:string){

    this._disponibilidadService.getDisponibilidad(intialDate,endDate, habitacion, stayNights, folio)
    .subscribe({      
        next:async (response)=>{

          const dispoResponse = await this._disponibilidadService.calcHabitacionesDisponibles(response,intialDate,endDate,cuarto);
          this.preAsignadasArray = dispoResponse.preAsignadasArray
          this.availavilityRooms = dispoResponse.avaibilityRooms

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

  buscaDispo(habitacion: any, select:MatSelect) {
    select.close(); // manually close dropdown
    // Reset disposition and set loading state
    this.rsvFromCalendar = false;
    this.resetDispo();
    this.formGroup.controls['checkbox'].setValue(false);
    this.isLoading = true;
    const folio = 'No Folio'

    // Handle case where no specific option is selected
    if (habitacion === '0') {
      this.setStep(0);
      return;
    }
  
    // Set selected room and cuarto based on the input
    this.selectedRoom = habitacion;
    this.cuarto = habitacion === '1' ? habitacion : habitacion.Codigo;
  
    // Perform operations related to the selected room
    //this.filterRates(); // is this needed?
    this.maxPeopleCheck(habitacion);
  
    // Update dropdown value index and bandera flag
    if (this.selectedRoom === '1') {
      this.bandera = true;
      this.dropDownHabValueIndex = 1;
    } else {
      this.bandera = false;
      this.dropDownHabValueIndex = '';
    }
    this.getDisponibilidad(this.intialDate,this.endDate, habitacion, this.stayNights, folio, this.cuarto);
  }

  revisaCapacidad(codigoCuarto:string){
    const hab = this.roomCodesComplete.find(item=>
      item.Codigo === codigoCuarto
    );
   
    if(hab){
      if(hab.Personas < (this.quantity + this.quantityNin)){
        this.mensajeCapacidad = `Este Tipo de Habitación solo permite cualquier combinación entre ${hab.Adultos} Adultos y/o ${hab.Ninos} Niños. Pero, su Capacidad Máxima es para ${hab.Personas} Personas.`;
        // if(this.quantity > hab.Adultos ){
        //   this.mensajeAdultos='El número de Adultos seleccionado exede la cantidad maxima de personas permitida para ste tipo de habitacion'+ '<br>';
        // }
        // if(this.quantityNin > hab?.Ninos){
        //   this.mensajeNinos='El número de Niños seleccionado exede la cantidad maxima de personas permitida para ste tipo de habitacion'
        // }
        return true;
      }else{
        this.mensajeCapacidad = '';
        // this.mensajeAdultos='';
        // this.mensajeNinos=''
        return false
      }
    }
    return false
  }

roomRates(minihabs: string) {
  let availbleRates = this.ratesArrayComplete.filter((item) => item.Estado === true);

  availbleRates = availbleRates.filter(obj => obj.Habitacion.includes(minihabs));

  // Update date range validation: include rates that overlap with the customer’s stay
  availbleRates = availbleRates.filter(item => {
    const llegadaDate = new Date(item.Llegada);
    const salidaDate = new Date(item.Salida);
    
    // Check if there is any overlap with the customer’s requested range
    return this.intialDate <= salidaDate && this.endDate >= llegadaDate;
  });

  availbleRates = availbleRates.filter(item => item.Tarifa !== 'Tarifa De Temporada');
  this.currentAvaibleRates = availbleRates;

  return availbleRates;
}

rateDateRange(tarifa: Tarifas): Period[] {
  if (tarifa.Tarifa === 'Tarifa Base') {
    return [];
  }

  // Ensure global range is correctly parsed
  const start = DateTime.fromISO(this.intialDate.toISOString()).startOf('day');
  const end = DateTime.fromISO(this.endDate.toISOString()).endOf('day');

  // Parse tarifa date range
  const tarifaStart = DateTime.fromISO(String(tarifa.Llegada)).startOf('day');
  const tarifaEnd = DateTime.fromISO(String(tarifa.Salida)).endOf('day');

  // Ensure there is an actual overlap
  if (tarifaEnd < start || tarifaStart > end) {
    console.log('No overlap with global range.');
    return [];
  }

  // Calculate the overlapping range
  const overlapStart = tarifaStart < start ? start : tarifaStart;
  const overlapEnd = tarifaEnd > end ? end : tarifaEnd;


  const availableRanges: Period[] = [{
    from: overlapStart.toFormat("dd 'de' MMMM"),
    to: overlapEnd.toFormat("dd 'de' MMMM"),
  }];

  this.currentOverlapRateDays.push({
    tarifa:tarifa.TarifaRack,
    avaibleRanges:availableRanges
  });

  return availableRanges;
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
    this.preAsignadasArray=[];
    this.accordionDisplay="display:none"
    this.cuarto=''
    this.availavilityCodeRooms = [];
    this.availavilityRooms = [];
    // this.ocupadasSet.clear;
    this.formGroup.patchValue({ habitacion: 0 });
  }

  addEventIntialDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.rsvFromCalendar=false

    this.intialDateEvent = []
    this.intialDateEvent.push(`${type}: ${event.value}`);
    this.intialDate = new Date(event.value!);

    // let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();
    // this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer(this.intialDate);

    this.formGroup.patchValue({ habitacion: 0 });
  }

  addEventEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.rsvFromCalendar=false

    this.endDateEvent = []
    this.endDateEvent.push(`${type}: ${event.value}`);
    this.endDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.floor(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer(this.intialDate);
    this.formGroup.patchValue({ habitacion: 0 });


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
    if(this.quantity<this.parametros.maxPersonas){
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
    if(this.quantityNin<this.parametros.maxPersonas){
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
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation:any, controlName:string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName:string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  ngOnDestroy(): void {
    
  }

  closeModal()
  {
    this.modal.close();
  }



  setEstatus(value: number): void {
    this.origenReserva = 'Recepcion';

    // Update the current status based on estatusArray
    if (this.estatusArray) {
        this.currentStatus = this.estatusArray.find(item => item.id === value)?.estatus || '';
    }

    // Define the folios based on the status value
    let selectedFolio: Foliador | undefined;

    switch (value) {
        case 1:
            selectedFolio = this.folios[2];
            break;
        case 2:
            selectedFolio = this.folios[0];
            break;
        case 5:
            selectedFolio = this.folios[1];
            break;
        case 7:
            selectedFolio = this.folios[3];
            break;
        default:
            selectedFolio = undefined; // Handle cases where value does not match any case
            break;
    }

    // Set currentFolio if selectedFolio is found
    if (selectedFolio) {
        this.currentFolio = selectedFolio;
    }

    // Call the submit method
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

    /** Checks whether an element is expanded. */
    isExpanded(element: any) {
      return this.expandedElement === element;
    }

  ratesBreakDownToogle(element:any){
    console.log('Clicked element:', element);
    console.log('Before:', this.expandedElement);
    this.expandedElement = this.expandedElement === element ? null : element;
    console.log('After:', this.expandedElement);
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

    roundUp(value: number): number {
      return Math.ceil(value);
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


