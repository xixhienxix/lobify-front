/* eslint-disable @angular-eslint/no-output-on-prefix */
import {  AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Tarifas, TarifasRadioButton } from 'src/app/models/tarifas';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/tools/date-picker.utils';
import { Huesped } from 'src/app/models/huesped.model';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Foliador } from 'src/app/pages/calendar/_models/foliador.model';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { DateTime } from 'luxon'; 
export interface preAsig {
  numero:any,
  codigo:string,
  checked:boolean,
  disabled:boolean
}

@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './nva-reserva.component.html',
  styleUrls: ['./nva-reserva.component.scss'],
  encapsulation: ViewEncapsulation.None,

  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
  ]
})


export class NvaReservaComponent implements  OnInit, OnDestroy, AfterViewInit
{
  constructor(
    private modal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService:NgbModal,
    private _disponibilidadService: DisponibilidadService,
    private changeDetector: ChangeDetectorRef
  ){

  }

  formGroup:FormGroup
  formGroup2:FormGroup
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
  ocupadasSet = new Set();
  mySetAvaible = new Set();

  @Input() ratesArray:Tarifas[]=[];
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
  huespedInformation:Huesped[]=[];


  /** Dates */
  intialDateEvent: string[] = [];
  endDateEvent: string[] = [];
  intialDate:Date = new Date();
  endDate:Date = new Date((new Date()).valueOf() + 1000*3600*24);
  intialDateFC = new FormControl(new Date());
  endDateFC = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));

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
  dataSource = new MatTableDataSource<any>();
  displayedColumnsFooter: string[] = ['Habitacion', 'Numero'];

  //**AGREGAR HUESPED TEMPALTE */
  get nombre(){return this.formGroup.get('nombre')}
  currentStatus:string='';
  currentFolio:Foliador;
  origenReserva:string='';
  noDisabledCheckIn:boolean;
  todayDate:Date = new Date();
  // closeResult: string;

  @Input() standardRatesArray:Tarifas[]=[]
  @Input() tempRatesArray:Tarifas[]=[]
  @Input() checkOut:string
  @Input() checkIn:string
  @Input() zona:string='America/Mexico_City'

  //On Calendar Trigger DefaultValue
  @Input() numeroCuarto:string=''
  @Input() rsvFromCalendar:boolean=false
  @Input() startTime:string=''
  @Input() endTime:string=''
  @Input()cuarto:string=''


  @Output() onNvaReserva: EventEmitter<Huesped[]> = new EventEmitter();
  @Output() onGetDisponibilidad: EventEmitter<any> = new EventEmitter();
  get inputs() {
    return this.formGroup.controls["nombreHabs"] as FormArray;
  }
  /** Subscription */

  async ngOnInit() {

    this.loadForm();
    this.todaysDateComparer();
    if(this.startTime !== '' && this.endTime !== ''){
      this.updateDatePicker(this.startTime,this.endTime);
      this.intialDate = new Date(this.startTime);
      this.endDate = new Date(this.endTime);
      //Minus 1 day 
      this.endDate.setDate(this.endDate.getDate() - 1);

      let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();
      this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

      this.getDisponibilidad(this.intialDate, this.endDate, this.cuarto, this.stayNights, "No Folio");
    }  
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  updateDatePicker(newStartTime: string, newEndTime: string): void {
    const newInitialDate = new Date(newStartTime);
    const newEndDate = new Date(new Date(newEndTime).valueOf() - 1000 * 3600 * 24);
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

  save(){
    const formData = this.formGroup.value;
    
      for(let i=0; i<this.preAsignadasArray.length; i++){
        if(this.preAsignadasArray[i].checked === true){
          const tarifa  = this.tarifaSeleccionada.find(obj =>
            obj.Habitacion.some(item => item === this.preAsignadasArray[i].codigo));

            let initialDate = DateTime.local().setZone(this.zona).set({
                day:this.intialDate.getDate(),
                month:this.intialDate.getMonth()+1,
                year:this.intialDate.getFullYear(), 
                hour:parseInt(this.checkOut.split(":")[0]),
                minute:parseInt(this.checkOut.split(":")[1])
              }).toISO()
              let endDate = DateTime.local().setZone(this.zona).set({
                day:this.endDate.getDate(),
                month:this.endDate.getMonth()+1,
                year:this.endDate.getFullYear(), 
                hour:parseInt(this.checkIn.split(":")[0]),
                minute:parseInt(this.checkIn.split(":")[1])
              }).toISO()


          const huesped = {
            folio:this.currentFolio.Letra + this.currentFolio.Folio,
            adultos:this.quantity,
            ninos:this.quantityNin,
            nombre:formData.nombre,
            estatus: this.currentStatus,
            llegada:initialDate ?? this.intialDate.toISOString(),
            salida:endDate ?? this.endDate.toISOString(),
            noches:this.stayNights,
            tarifa:tarifa === undefined ? '' : tarifa.Tarifa,
            porPagar:this.totalPorCuenta,
            pendiente:this.totalPorCuenta,
            origen:this.origenReserva,
            habitacion:this.preAsignadasArray[i].codigo,
            telefono:formData.telefono,
            email:formData.email,
            numeroDeCuarto:this.preAsignadasArray[i].numero,
            creada:new Date().toISOString(),
            motivo:'',
            fechaNacimiento:'',
            trabajaEn:'',
            tipoDeID:'',
            numeroDeID:'',
            direccion:'',
            pais:'',
            ciudad:'',
            codigoPostal:'',
            lenguaje:'',
            numeroCuarto:this.preAsignadasArray[i].numero,
            tipoHuesped:'',
            notas:'',
            vip:'',
            ID_Socio:0,
            estatus_Ama_De_Llaves:'LIMPIA',      
          }
    
           this.huespedInformation.push(huesped)
        }
    }
    
    this.onNvaReserva.emit(this.huespedInformation);
    
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

  todaysDateComparer(){
        //Disable CheckIn if the sTart Day is not today
        if(this.intialDate.setHours(0,0,0,0) === this.todayDate.setHours(0,0,0,0)) {
          this.noDisabledCheckIn=true
        }     
        else{
          this.noDisabledCheckIn=false
        }
  }

  loadForm(){
    this.formGroup = this.fb.group({
      adultos:[{value:1, disabled:true }, Validators.required],
      ninos:[{value:0,disabled:true}, Validators.required],
      habitacion:['', Validators.compose([Validators.required])],
      checkbox:[{value:false, disabled:true},Validators.required],
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: ['', Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: ['', Validators.compose([Validators.nullValidator,Validators.pattern('[0-9]+'),Validators.minLength(10),Validators.maxLength(14)])],
      searchTerm:['',Validators.maxLength(100)]
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

ratesTotalCalc(tarifa:Tarifas, estanciaPorNoche:number, codigosCuarto = this.cuarto, tarifaPromedio:boolean = false){

    const adultos = this.quantity
    const ninos = this.quantityNin
    let tarifaTotal = 0;

    if(tarifa.Tarifa !== 'Tarifa Base'){
      if(tarifa.Estado === true){
        const dayNames = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];

        // Cycle All Days
        for (let start = new Date(this.intialDate); start.setHours(0,0,0,0) < this.endDate.setHours(0,0,0,0); start.setDate(start.getDate() + 1)) {
          tarifa.TarifasActivas.map((item)=>{
            const validDays = item.Dias!.filter((x)=> x.checked === true)    
            const day = start.getDay();
            const validDay = validDays.find((item) => item.name === dayNames[day])?.checked // Revisar si el dia es valido

            if(validDay){
              if(item.Activa === true){
                switch (adultos) {
                  case 1:
                    tarifaTotal += item.Tarifa_1*(adultos)
                    break;
                  case 2:
                    tarifaTotal += item.Tarifa_2*(adultos)
                    break;
                  case 3:
                    tarifaTotal += item.Tarifa_3*(adultos)
                    break;
                  default:
                    tarifaTotal += (item.Tarifa_3*(adultos))
                }
                  if(ninos !==0 ){
                    tarifaTotal += (item.Tarifa_N*ninos)
                  }
              } 
            }else { // La Tarifa Especial No Es Valida para este dia entonses se tomara el precio de la base
              tarifaTotal += this.retriveBaseRatePrice(codigosCuarto,start);
            }
          });
        }
      }
      // return Math.trunc(tarifa.TarifaRack!*estanciaPorNoche);

    }else if(tarifa.Tarifa === 'Tarifa Base'){
      for (let start = new Date(this.intialDate); start < this.endDate; start.setDate(start.getDate() + 1)) {
        tarifaTotal += this.retriveBaseRatePrice(codigosCuarto,start);
      }
    }
    if(tarifaPromedio){
      return Math.ceil(tarifaTotal/this.stayNights);
    }else{
      return (tarifaTotal);
    }
  }

  retriveBaseRatePrice(codigosCuarto:string, checkDay:Date){
    let tarifaTotal = 0;
    const adultos = this.quantity
    const ninos = this.quantityNin

    const tarifaBase = this.standardRatesArray.find(obj =>
      obj.Habitacion.some(item => item === codigosCuarto)); 

    const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto,checkDay);

    if(tarifaTemporada !== 0){
      return Math.ceil(tarifaTemporada)
    }else{
      tarifaBase?.TarifasActivas.map((item)=>{
        switch (adultos) {
          case 1:
            tarifaTotal += item.Tarifa_1*(adultos)
          break;
          case 2:
            tarifaTotal += item.Tarifa_2*(adultos)
          break;
          case 3:
            tarifaTotal += item.Tarifa_3*(adultos)
          break;
          default:
          tarifaTotal += (item.Tarifa_3*(adultos))
          }

          if(ninos !==0 ){
            tarifaTotal += (item.Tarifa_N*ninos)}
      });
      return Math.ceil(tarifaTotal);
    }
  }

  checkIfTempRateAvaible(codigoCuarto:string, fecha:Date){
    let tarifaTotal = 0;
    const adultos = this.quantity
    const ninos = this.quantityNin

    const tarifaTemporada = this.tempRatesArray.filter(obj =>
      obj.Habitacion.some(item => item === codigoCuarto)); 

    tarifaTemporada.map(item=>{
        const dayNames = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
        // let secondValidDates
        let validDays = item?.TarifasActivas[0].Dias!.filter((x)=> x.checked === true);
        //Check if Second Temp Rate Exist
        // if(item?.TarifasActivas.length === 2 && validDays === undefined){
        //   secondValidDates = item?.TarifasActivas[1].Dias!.filter((x)=> x.checked === true);
        // }
        // if(secondValidDates){
        //   validDays = secondValidDates;
        // }

        const day = fecha.getDay();
        const validDay = validDays.find((item) => item.name === dayNames[day])?.checked

        if(validDay){
          if(item.Estado === true) {
            item?.TarifasActivas.map((item)=>{
              switch (adultos) {
                case 1:
                  tarifaTotal += item.Tarifa_1*(adultos)
                break;
                case 2:
                  tarifaTotal += item.Tarifa_2*(adultos)
                break;
                case 3:
                  tarifaTotal += item.Tarifa_3*(adultos)
                break;
                default:
                tarifaTotal += (item.Tarifa_3*(adultos))
                }
        
                if(ninos !==0 ){
                  tarifaTotal += (item.Tarifa_N*ninos)}
            });
            return Math.ceil(tarifaTotal);
          }else{
            tarifaTotal=0;
          }
        }else{
          return tarifaTotal=0
        }
    })
    return tarifaTotal
  }

  getDisponibilidad(intialDate:Date,endDate:Date, habitacion:string, stayNights:number, folio:string){
    this._disponibilidadService.getDisponibilidad(intialDate,endDate, habitacion, stayNights, folio)
    .subscribe({      
        next:(response)=>{

          this.ocupadasSet = new Set(response);

          // Filtrar las habitaciones disponibles
          const habitacionesDisponibles = this.roomCodesComplete.filter(habitacion => !this.ocupadasSet.has(habitacion.Numero));
          console.log("habitacionesDisponibles ", habitacionesDisponibles)

          // Paso 1: Crear el array preAsignadasArray
          this.preAsignadasArray = habitacionesDisponibles.map(item => ({
            numero: item.Numero,
            codigo: item.Codigo,
            checked: false,
            disabled: true
          }));

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
          console.log("this.intialDate DIspono",this.intialDate)
          console.log("this.endDate DIspono",this.endDate)
          console.log("this.staynights DIspono",this.stayNights)
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

  buscaDispo(habitacion:any){
    this.rsvFromCalendar=false
    // No Option Selected
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

    this.getDisponibilidad(this.intialDate,this.endDate, habitacion, this.stayNights, folio);
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
    
    availbleRates = availbleRates.filter(item => item.Tarifa !== 'Tarifa De Temporada');
    
    return availbleRates
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
    this.preAsignadasArray=[];
    this.accordionDisplay="display:none"
    this.cuarto=''
    this.availavilityCodeRooms = [];
    this.availavilityRooms = [];
    this.ocupadasSet.clear;
    this.formGroup.patchValue({['habitacion']: 0});
  }

  addEventIntialDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.intialDateEvent = []
    this.intialDateEvent.push(`${type}: ${event.value}`);
    this.intialDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer();

  }

  addEventEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.endDateEvent = []
    this.endDateEvent.push(`${type}: ${event.value}`);
    this.endDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    this.resetDispo();
    this.todaysDateComparer();
  }

  getRooms(){
    this.ocupadasSet.forEach((element)=>{
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

