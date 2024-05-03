import {  Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from 'luxon';
import { Observable, Subject, filter, first, firstValueFrom, map, takeUntil } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Tarifas } from 'src/app/models/tarifas';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/tools/date-picker.utils';

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


export class NvaReservaComponent implements  OnInit, OnDestroy
{
  constructor(
    private modal: NgbActiveModal,
    private fb: FormBuilder,
    private _habitacionService: HabitacionesService,
    private _tarifasService: TarifasService,
    private _disponibilidadService: DisponibilidadService){
      
  }

  formGroup:FormGroup
  isLoading:boolean=false;
  accordionDisplay="";
  bandera:boolean=false;

  /** Current Values */
  selectedRoom:any;

  /** Styling */
  styleDisponibilidad:string='background-color:#99d284;'


  /** Models */
  roomCodes:Habitacion[]=[];
  mySet = new Set();
  ratesArray:Tarifas[]=[];
  ratesArrayComplete:Tarifas[]=[]
  infoRoomsAndCodes:any=[];
  availavilityRooms:Habitacion[]=[]
  filterRatesAray:Tarifas[]=[]

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
  quantity:number=0;

  /** Flags */
  dropDownHabValueIndex:any
  cuarto:string=''

  /**Table */
  displayedColumns: string[] = ['Tarifa', '$ Promedio x Noche', 'Total', 'Acciones'];
  dataSource = new MatTableDataSource<any>();
  displayedColumnsFooter: string[] = ['Habitacion', 'Numero'];


  /** Subscription */
  private ngUnsubscribe = new Subject<void>();

  async ngOnInit() {

    this.loadForm();
    this.checkRoomCodesIndexDB();
    this.checkRatesIndexDB();
  }

  async checkRatesIndexDB(){
    const ratesIndexDB:Tarifas[] = await this._habitacionService.readIndexDB("Rates");

    /** Checks if RatesArray is on IndexDb */
    if(ratesIndexDB){
      this.ratesArray = ratesIndexDB
      this.ratesArrayComplete = ratesIndexDB
    }else {
      this.ratesArray = await firstValueFrom(this._tarifasService.getAll());
      this.ratesArrayComplete = await firstValueFrom(this._tarifasService.getAll());
    }
  }

  async checkRoomCodesIndexDB(){
    const roomsCodesIndexDB:Habitacion[] = await this._habitacionService.readIndexDB("Rooms");

        /** Check if RoomsCode are on IndexDb */
        if(roomsCodesIndexDB){
          this.roomCodes = Object.values(
            roomsCodesIndexDB.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        ); 
      }else{
          this.roomCodes = await firstValueFrom(this._habitacionService.getAll());
        }
  }

  loadForm(){
    this.formGroup = this.fb.group({
      adultos:[1, Validators.required],
      ninos:[0, Validators.required],
      habitacion:['', Validators.compose([Validators.required])],
      checkbox:[false,Validators.required],
    });
  }

  tarifaRadioButton(tarifa:any){
    // this.tarifaSeleccionada=tarifa
    // for(let i=0;i<this.tarifasArrayCompleto.length;i++){
    //   if(this.tarifasArrayCompleto[i].Tarifa=='Tarifa Estandar'){
    //     for(let x=0;x<this.tarifasArrayCompleto[i].Habitacion.length;x++){
    //       if(this.tarifasArrayCompleto[i].Habitacion[x]==this.cuarto){
    //         this.tarifaEstandarSeleccionada=this.tarifasArrayCompleto[i]
    //       }
    //     }
    //   }
    // }
  }

  preAsignar(numero:any,codigo:string,checked:boolean){
    console.log("numero: ",numero);
    console.log("codigo: ",codigo);
    console.log("checked: ",checked);
  }

  buscaDispo(habitacion:any){
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
    this.cuarto=habitacion

    this.filterRates();

    console.log("tarifas: ",this.filterRatesAray)

    this.maxPeopleCheck(habitacion);

    if(this.selectedRoom === '1'){
      this.bandera=true
      this.dropDownHabValueIndex=1
    }else{
      this.bandera=false
      this.dropDownHabValueIndex=''
    }

    this._disponibilidadService.getDisponibilidad(this.intialDate,this.endDate, habitacion, this.stayNights, folio)
      .subscribe(
        {      
          next:(response)=>{
            if(!this.roomCodes){
              this.checkRoomCodesIndexDB();
            }else{
              this.roomCodes.forEach((val)=>{ this.mySet.add(val.Numero) })
              response.forEach((val)=>{this.mySet.delete(val)})   
            }

            this.mySet.forEach((value)=> {
              const results = this.roomCodes.find((item) => item.Numero === value )  
              const filterResultRoomCode = this.roomCodes.find((val)=> val.Numero === value);

              if(filterResultRoomCode !== undefined){
                this.availavilityRooms.push(filterResultRoomCode);
              }

              if(results !== undefined){
                this.infoRoomsAndCodes.push({
                  nombreHabitacion:value,
                  tipodeCuarto:results.Codigo
                }) 
              }
            })
            this.setStep(1) 
          },
          error:()=>{
          },
          complete:()=>{
            this.accordionDisplay=''
            this.isLoading=false
          }}
      )
  }

  filterRates(){
                /**Comparador de Fechas Tarifas */
                // this.ratesArray=this.ratesArrayComplete.filter(d => {
                //     return (this.intialDate.getTime() >= new Date(d.Llegada).getTime() );
                // });
                if(this.ratesArray){
                       this.filterRatesAray = this.ratesArray.filter((val) => 
                         new Date(val.Llegada).getTime() <= this.intialDate.getTime() && new Date(val.Salida).getTime() >= this.endDate.getTime() )
                } 
        
                /**Comparador de Estancias Tarifario */
                this.filterRatesAray=this.filterRatesAray.filter(x=>{
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
                    
                for(let y=fromDate;fromDate>=timeLlegada;timeLlegada=timeLlegada.plus({ days: 1 })){
                      if(fromDate.hasSame(timeLlegada, 'day') && fromDate.hasSame(timeLlegada, 'year') && fromDate.hasSame(timeLlegada, 'month')){
    
                        var diaDeLlegada = fromDate.setLocale("es").weekdayShort
                        var diaDeLlegadaMayus = diaDeLlegada!.charAt(0).toUpperCase() + diaDeLlegada!.slice(1);
                        
                        for(let x=0;x<this.filterRatesAray[i].Dias.length;x++){
                          if(this.filterRatesAray[i].Dias[x].name==diaDeLlegadaMayus && this.filterRatesAray[i].Dias[x].checked==false){
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

  maxPeopleCheck(codigoCuarto:any){
    var maxPeopleFlag
    /**Revision de Maximo de Personas */

    if(codigoCuarto=='1'){
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
        return(d.Codigo==codigoCuarto)
      })

      if(this.quantity>this.selectedRoom[0].Personas){
        this.maxPeopleFlag=true
        this.styleDisponibilidad='background-color:#fa6d7c;'
      }else{
        this.styleDisponibilidad='background-color:#99d284;'
        this.maxPeopleFlag=false
      }
    }
  }

  resetDispo(){
    this.accordionDisplay="display:none"
    this.cuarto=''
    this.availavilityRooms = [];
    this.mySet.clear
  }

  addEventIntialDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.intialDateEvent = []
    this.intialDateEvent.push(`${type}: ${event.value}`);
    this.intialDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.round(Difference_In_Time / (1000 * 3600 * 24));

    console.log("Intial Dates-> ",this.intialDateEvent)
  }

  addEventEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.endDateEvent = []
    this.endDateEvent.push(`${type}: ${event.value}`);
    this.endDate = new Date(event.value!);

    let Difference_In_Time = this.endDate.getTime() - this.intialDate.getTime();

    this.stayNights = Math.round(Difference_In_Time / (1000 * 3600 * 24));

    console.log("End Dates-> ",this.endDateEvent)

  }

  getRooms(){
  //   <ng-container *ngFor="let habitacionesDisponibles of mySet">
  //   <ng-container *ngFor="let tipocuarto of roomCodes">
  //     <ng-container *ngIf="tipocuarto.Numero == habitacionesDisponibles">
  //       <br><mat-checkbox  formControlName="checkbox"  #checked (change)="preAsignar(tipocuarto.Numero,tipocuarto.Codigo,checked.checked)"></mat-checkbox> &nbsp; <label style="margin-right: 7%">{{ tipocuarto.Numero }}</label>
  //     </ng-container>
  //   </ng-container>
  // </ng-container>
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
  }
  minus()
  {
    if(this.quantity>1){
    this.quantity--;
    }else
    this.quantity
  }
  plusNin()
  {
    if(this.quantityNin<7){
      this.quantityNin++;
    }
  }
  minusNin()
  {
    if(this.quantityNin>0){
    this.quantityNin--;
    }else
    this.quantityNin
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
  }
