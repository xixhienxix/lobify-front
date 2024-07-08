import {  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from 'luxon';
import { Observable, Subject, filter, first, firstValueFrom, map, takeUntil } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Tarifas, TarifasRadioButton } from 'src/app/models/tarifas';
import { DisponibilidadService } from 'src/app/services/disponibilidad.service';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/tools/date-picker.utils';
import { Estatus } from '../../_models/estatus.model';
import { Foliador } from '../../_models/foliador.model';
import { EstatusService } from '../../_services/estatus.service';
import { FoliosService } from '../../_services/folios.service';
import { Huesped } from 'src/app/models/huesped.model';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
    private _disponibilidadService: DisponibilidadService,
    private _folioservice: FoliosService,
    private _estatusService:EstatusService,
    private modalService:NgbModal){
      
  }

  formGroup:FormGroup
  formGroup2:FormGroup
  isLoading:boolean=false;
  accordionDisplay="";
  bandera:boolean=false;
  closeResult:string


  /** Current Values */
  selectedRoom:any;
  tarifaSeleccionada:TarifasRadioButton[]=[];

  /** Styling */
  styleDisponibilidad:string='background-color:#99d284;'

  /** Models */
  roomCodes:Habitacion[]=[];
  mySet = new Set();
  ratesArray:Tarifas[]=[];
  ratesArrayComplete:Tarifas[]=[]
  infoRoomsAndCodes:any=[];
  availavilityCodeRooms:Habitacion[]=[]
  availavilityRooms:Habitacion[]=[]
  filterRatesAray:Tarifas[]=[]
  filterRatesbyRoomName:Tarifas[]=[]
  roomCodesComplete:Habitacion[]=[]
  preAsignadasArray:any[]=[]
  standardRatesArray:Tarifas[]=[]
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
  quantity:number=0;

  /** Flags */
  dropDownHabValueIndex:any
  cuarto:string=''
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

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onNvaReserva: EventEmitter<Huesped[]> = new EventEmitter();

  get inputs() {
    return this.formGroup.controls["nombreHabs"] as FormArray;
  }
  /** Subscription */
  private ngUnsubscribe = new Subject<void>();

  async ngOnInit() {

    this.loadForm();
    this.checkRoomCodesIndexDB();
    this.checkRatesIndexDB();
    this.checkEstatusIndexDB();
    this.checkFoliadorIndexDB();
    this.todaysDateComparer();
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

          const huesped = {
            folio:this.currentFolio.Letra + this.currentFolio.Folio,
            adultos:formData.adultos,
            ninos:formData.ninos,
            nombre:formData.nombre,
            estatus: this.currentStatus,
            llegada:this.intialDate.toISOString(),
            salida:this.endDate.toISOString(),
            noches:this.stayNights,
            tarifa:tarifa === undefined ? '' : tarifa.Tarifa,
            porPagar:tarifa === undefined ? 0 : tarifa.TarifaRack,
            pendiente:tarifa === undefined ? 0 : tarifa.TarifaRack,
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
        if(this.intialDate.setHours(0,0,0,0) == this.todayDate.setHours(0,0,0,0)) {
          this.noDisabledCheckIn=true
        }     
        else{
          this.noDisabledCheckIn=false
        }
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
      this.standardRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa Estandar');
    }
  }

  async checkRoomCodesIndexDB(){
    const roomsCodesIndexDB:Habitacion[] = await this._habitacionService.readIndexDB("Rooms");

        /** Check if RoomsCode are on IndexDb */
        if(roomsCodesIndexDB){
          this.roomCodesComplete = roomsCodesIndexDB;
          this.roomCodes = Object.values(
            roomsCodesIndexDB.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        ); 
      }else{
          this.roomCodes = await firstValueFrom(this._habitacionService.getAll());
          this.roomCodesComplete = this.roomCodes
          this.roomCodes = Object.values(
            this.roomCodes.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        );         
      }
  }

  async checkEstatusIndexDB(){
    const estatusCodesIndexDB:Estatus[] = await this._estatusService.readIndexDB("Rooms");
        /** Check if EstatusCodes are on IndexDb */
      if(estatusCodesIndexDB){
          this.estatusArray = estatusCodesIndexDB;
          console.log(this.estatusArray)

      }else{
          this.estatusArray = await firstValueFrom(this._estatusService.getAll());      
          console.log(this.estatusArray)

      }
  }

  async checkFoliadorIndexDB(){
    const foliosIndexDB:Foliador[] = await this._folioservice.readIndexDB("Foliosr");
        /** Check if EstatusCodes are on IndexDb */
      if(foliosIndexDB){
          this.folios = foliosIndexDB;
      }else{
          this.folios = await firstValueFrom(this._folioservice.getAll());      
      }
  }

  loadForm(){
    this.formGroup = this.fb.group({
      adultos:[1, Validators.required],
      ninos:[0, Validators.required],
      habitacion:['', Validators.compose([Validators.required])],
      checkbox:[false,Validators.required],
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: ['', Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: ['', Validators.compose([Validators.nullValidator,Validators.pattern('[0-9]+'),Validators.minLength(10),Validators.maxLength(14)])],
      searchTerm:['',Validators.maxLength(100)]
    });
    this.formGroup2 = this.fb.group({
      checkbox:[false,Validators.required],
    })
  }
  


  tarifaRadioButton(tarifas:Tarifas, event:any, codigo:string){
    const checkedStatus = event.source.checked
    const tarifa = tarifas

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



  preAsignar(numero:any,codigo:string,checked:boolean){
    if(this.preAsignadasArray.length >= 0){
      const index = this.preAsignadasArray.findIndex((item) => item.numero === numero)
      if(index != -1){
        this.preAsignadasArray[index].checked = checked
      }else{
        this.preAsignadasArray.push({numero,codigo,checked})
      }
    }else{
      this.preAsignadasArray.push({numero,codigo,checked})
    }
}

  ratesTotalCalc(tarifa:Tarifas, estanciaPorNoche:number, codigosCuarto = this.cuarto){
    if(tarifa.Tarifa === 'Tarifa Estandar'){
      return Math.trunc(tarifa.TarifaRack!*estanciaPorNoche)
    }else {
      let tarifaTotal=0
      const validDays = tarifa.Dias!.filter((x)=> x.checked === true)    
      const dayNames = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"]

      for (let start = new Date(this.intialDate); start < this.endDate; start.setDate(start.getDate() + 1)) {
        const day = start.getDay();
        const validDay = validDays.find((item) => item.name === dayNames[day])?.checked
        
        if(validDay){
          tarifaTotal += tarifa.TarifaRack!
        }else{
          if(this.cuarto==="1"){
            const tarifaEstandar  = this.standardRatesArray.filter(obj =>
              obj.Habitacion.some(item => item === codigosCuarto)); 
            tarifaTotal += tarifaEstandar[0].TarifaRack!  
          }else{
            const tarifaEstandar  = this.standardRatesArray.filter(obj =>
              obj.Habitacion.some(item => item === this.cuarto)); 

            tarifaTotal += tarifaEstandar[0].TarifaRack! 
          }
        }
      }
      return Math.trunc(tarifaTotal)
    }
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
    
    if(habitacion === '1'){
      this.cuarto=habitacion
    }else {
      this.cuarto=habitacion.Codigo
    }


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
            // if(response.length!=0){
            //   console.log("cuartos ocupados")
            // }else{
              if(!this.roomCodesComplete){
                this.checkRoomCodesIndexDB();
              }else{
                this.roomCodesComplete.forEach((val)=>{ this.mySet.add(val.Numero) })
                //ELimina habitaciones no disponibles del Set
                response.forEach((val)=>{this.mySet.delete(val)})   
              }
  
              this.mySet.forEach((value)=> {
                const results = this.roomCodesComplete.find((item) => item.Numero === value )  
                const filterResultRoomCode = this.roomCodes.find((val)=> val.Numero === value);
  
                if(filterResultRoomCode !== undefined){
                  this.availavilityCodeRooms.push(filterResultRoomCode);
                }
  
                if(results !== undefined){
                  this.availavilityRooms.push(results);
                  this.infoRoomsAndCodes.push({
                    nombreHabitacion:value,
                    tipodeCuarto:results.Codigo
                  }) 
                }
              });
            //}
          },
          error:()=>{
          },
          complete:()=>{
            this.accordionDisplay=''
            this.isLoading=false
          }}
      )
  }

  roomRates(minihabs:string){
    let availbleRates = this.ratesArrayComplete.filter((item) => item.Estado === true); 

    availbleRates  = availbleRates.filter(obj =>
      obj.Habitacion.some(item => item === minihabs));
    return availbleRates
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
                    
                for(let y=fromDate;fromDate>=timeLlegada;timeLlegada=timeLlegada.plus({ days: 1 })){
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
               console.log(this.filterRatesAray) 
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
  }
  minusNin()
  {
    if(this.quantityNin>0){
    this.quantityNin--;
    }else{
    this.quantityNin
    }
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
      // this.estatusID=value
      this.origenReserva='Walk-In'
    }
    else if(value===2){
    this.currentFolio=this.folios[0]
    // this.estatusID=value
    this.origenReserva='Reserva'}

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

  promptMessage(header:string,message:string, obj?:any){
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
