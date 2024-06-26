import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';

import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Subject, firstValueFrom } from 'rxjs';
import { WarningComponent } from './_helpers/warning.prompt.component';
import { Tarifas } from 'src/app/models/tarifas';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { EditReservaComponent } from './reservations/edit-reserva/edit-reserva.component';
import { Estatus } from './_models/estatus.model';
import { EstatusService } from './_services/estatus.service';
import { HuespedService } from 'src/app/services/huesped.service';
import { HouseKeeping } from './_models/housekeeping.model';
import { HouseKeepingService } from 'src/app/services/housekeeping.service';
import { Huesped } from 'src/app/models/huesped.model';
import { ContentComponent } from './components/content/content.component';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Adicional } from 'src/app/models/adicional.model';
import { Promesa } from './_models/promesas.model';
import { PromesaService } from 'src/app/services/promesas.service';
import { AdicionalService } from 'src/app/services/adicionales.service';
import { DateTime } from 'luxon';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { edoCuenta } from './_models/estado_de_cuenta.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit{
  submitLoading:boolean=false
  closeResult:string
  currentFolio=''
  stayNights:number=1
  eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  datasourceArray :Record<string, any>[]=[]
  colorDict={
    0:'#99d284',
    1:'#fab3db',
    2:'#d0aaec',
    3:'#fac34e'

    //#fab3db - Reserva Temporal
    //#d0aaec - Reserva Uso Temporal
    //#fac34e - Reservacion
  }
  //Models
  estatusArray:Estatus[]=[]
  @Input() allReservations:Huesped[]=[]
  
  promesasDisplay:boolean=false;
  onSuccessResponse: Subject<boolean> = new Subject();

  roomCodesComplete:Habitacion[];
  roomCodes:Habitacion[];
  houseKeepingCodes:HouseKeeping[]=[]



  changingValue: Subject<any> = new Subject();
  changingPromesasValue: Subject<any> = new Subject();
  changingAdicionalesValue: Subject<Adicional[]> = new Subject();

  @ViewChild('email') emailModal: null;

  constructor(    
    private modalService:NgbModal,
    private _habitacionService: HabitacionesService,
    private _tarifasService: TarifasService,
    private _estatusService: EstatusService,    
    private _huespedService: HuespedService,
    private _housekeepingService:HouseKeepingService,
    private _roomService: HabitacionesService,
    private _promesasService: PromesaService,
    private _adicionalService: AdicionalService
  ){
    
  }

  async ngOnInit(){
    await this.checkRoomCodesIndexDB();
    await this.getReservations();
    await this.checkEstatusIndexDB();
    await this.checkReservationsIndexDB();
    await this.checkAmaCodesIndexDB();
  }

  async getReservations(){
    this._huespedService.getAll().subscribe({
      next:(value)=>{
        this.changingValue.next(value);
      }

    })  
  }

  async checkRoomCodesIndexDB(){
    const roomsCodesIndexDB:Habitacion[] = await this._roomService.readIndexDB("Rooms");
        /** Check if RoomsCode are on IndexDb */
      if(roomsCodesIndexDB){
          this.roomCodesComplete = [...roomsCodesIndexDB];
          this.roomCodes = Object.values(
            roomsCodesIndexDB.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        ); 
      }else{
          this.roomCodes = await firstValueFrom(this._roomService.getAll());
          this.roomCodesComplete = [...this.roomCodes]
          this.roomCodes = Object.values(
            this.roomCodes.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        );         
      }
      console.log("RoomCodeCOmplete d mmain container: ", this.roomCodesComplete)
  }

  async checkEstatusIndexDB(){
    const estatusIndexDB:Estatus[] = await this._estatusService.readIndexDB("EstatusCodes");
    /** Check if RoomsCode are on IndexDb */
    if(estatusIndexDB){
        this.estatusArray = estatusIndexDB
    }else{
      this.estatusArray = await firstValueFrom(this._estatusService.getAll());
    }
  }

  async checkReservationsIndexDB(){
    const reservationsIndexDB:Huesped[] = await this._huespedService.readIndexDB("Reservations");
    /** Check if RoomsCode are on IndexDb */
    if(reservationsIndexDB){
      this.allReservations = reservationsIndexDB
    }else{
       this.allReservations = await firstValueFrom(this._huespedService.getAll());
    }
  }

  async checkAmaCodesIndexDB(){
    const amaIndexDB:HouseKeeping[] = await this._housekeepingService.readIndexDB("houseKeeperCodes");
    /** Check if RoomsCode are on IndexDb */
    if(amaIndexDB){
      this.houseKeepingCodes = amaIndexDB
    }else{
       this.houseKeepingCodes = await firstValueFrom(this._housekeepingService.getAll());
    }
  }

  // async checkPromesasIndexDB(){
  //   const promesasIndexDb:Promesa[] = await this._promesasService.readIndexDB("Promesas");
  //   /** Check if RoomsCode are on IndexDb */
  //   if(promesasIndexDb){
  //     return promesasIndexDb
  //   }else{
  //     return await firstValueFrom(this._promesasService.getPromesas(this.currentFolio));
  //   }
  // }

  async checkAdicionalesIndexDB(){
    const adicionalesIndexDB:Adicional[] = await this._adicionalService.readIndexDB("Adicional");
    /** Check if RoomsCode are on IndexDb */
    if(adicionalesIndexDB){
      return adicionalesIndexDB
    }else{
       return await firstValueFrom(this._adicionalService.getAdicionales());
    }
  }

  onNvaReserva(huesped:Huesped[]){
    this.submitLoading=true;

    this._huespedService.addPost(huesped).subscribe({
      next:async (data)=>{
        this.allReservations = await firstValueFrom(this._huespedService.getAll());

        this.eventsSubject.next(huesped);
        this.promptMessage('Exito','Reservacion Guardada con exito');
        this.submitLoading=false

      },
      error:()=>{
        this.promptMessage('Error','La Reservacion no se pudo generar con exito intente nuevamente')
      },
      complete:()=>{
        this.submitLoading=false
      }
    })
  }

  onEditRsv(data:any){
    if(data.data.hasOwnProperty("Id")){

      const currentHuesped = this.allReservations.find(item=>item.folio === data.data.Folio)!;
      this.currentFolio = data.data.Folio;
      const colorAma = this.houseKeepingCodes.find(item=>
        item.Descripcion == currentHuesped.estatus_Ama_De_Llaves!.toUpperCase()
      )?.Color!

      const modalRef = this.modalService.open(EditReservaComponent,{ size: 'md', backdrop:'static' })
      modalRef.componentInstance.data = data.data
      modalRef.componentInstance.promesasDisplay = this.promesasDisplay
      modalRef.componentInstance.estatusArray = this.estatusArray
      modalRef.componentInstance.currentHuesped = currentHuesped
      modalRef.componentInstance.colorAma = colorAma
      modalRef.componentInstance.onGuardarPromesa.subscribe({
        next:(promesa:any)=>{
          this.submitLoading=true;
          this._promesasService.guardarPromesa(promesa.folio,promesa.fechaPromesaPago,promesa.promesaPago.value,promesa.estatus).subscribe({
            next:(val)=>{
              this.promesasDisplay=true
              this.onSuccessResponse.next(true);
            },
            error:(error)=>{
              
            },
            complete:()=>{
              this.submitLoading=false;
            }
          })
        }
      })
      modalRef.componentInstance.onAlertMessage.subscribe({
        next:(message:AlertsMessageInterface)=>{
          this.promptMessage(message.tittle,message.message);
        }
      })
      // modalRef.componentInstance.changingPromesasValue.subscribe({
      //   next:(val:Promesa[])=>{
      //     console.log(val);
      //     //to test
      //   }
      // })
      modalRef.componentInstance.onGetAdicionales.subscribe({
        next:async (flag:boolean)=>{
          const adicionales = await this.checkAdicionalesIndexDB();
          this.changingAdicionalesValue.next(adicionales)
        }
      })
      modalRef.componentInstance.onGetPromesas.subscribe({
        next:async (folio:string)=>{
          this._promesasService.getPromesas(folio).subscribe({
            next:(value:Promesa[])=>{
              this.processPromesasResponse(value);
            }
          })
        //                   },
        //                   (err)=>{
        //                     if (err)
        //                     {
        //                       const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        //                       modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
        //                       modalRef.componentInstance.alertHeader='Error'
        //                       modalRef.result.then((result) => {
        //                         this.closeResult = `Closed with: ${result}`;
        //                         }, (reason) => {
        //                             this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        //                         });
        //                         setTimeout(() => {
        //                           modalRef.close('Close click');
        //                         },4000)
        //                     }
        //                   }
        //                 )
        //                 this.subscription.push(sb)
        }
      })
      modalRef.componentInstance.onAgregarPago.subscribe({
        next:(val:edoCuenta)=>{
           // const sb = this.edoCuentaService.agregarPago(pago).subscribe(
    //   (value)=>{
    //     this.isLoading=false
        
    //     const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' })
    //     modalRef.componentInstance.alertHeader ='Exito'
    //     modalRef.componentInstance.mensaje ='Movimiento agregado al Estado de cuenta del cliente'
    //       setTimeout(() => {
    //         modalRef.close('Close click');
    //       },4000)
    //       this.promesaService.updatePromesa(this.idPromesa,row.Estatus).subscribe(
    //         (value)=>
    //         {
    //           if(this.currentHuesped.estatus=='Reserva Sin Pago'||this.currentHuesped.estatus=='Esperando Deposito')
    //           {
    //             this.currentHuesped.estatus='Deposito Realizado'
    //           }
    //           this.customerService.updateEstatusHuesped(this.currentHuesped).subscribe(
    //             (value)=>{
    //               this.customerService.setthis.currentHuespedValue=this.currentHuesped
    //               this.customerService.fetch(sessionStorage.getItem("HOTEL"));
    //             },
    //             (error)=>{

    //             }
    //           )
    //           this.promesasPagoList=[]
    //           this.getPromesa();
    //         },
    //         (error)=>{
    //           if(error)
    //           {
      
    //             const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
    //             modalRef.componentInstance.alertHeader ='Error'
    //             modalRef.componentInstance.mensaje ='No se pudo actualizar el estatus de la Promesa'
  
    //               setTimeout(() => {
    //                 modalRef.close('Close click');
    //               },4000)
    //           }
    //         }
    //       )
    //   },
    //   (err)=>
    //   {
    //     this.isLoading=false
    //     if(err)
    //     {

    //       const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
    //       modalRef.componentInstance.alertHeader ='Error'
    //     modalRef.componentInstance.mensaje ='No se pudo Guardar el Pago Intente Nuevamente'

        
    //         setTimeout(() => {
    //           modalRef.close('Close click');
    //         },4000)
              
    //       this.isLoading=false
      
    //     }
    //   },
    //   ()=>{//FINALLY
    //   }
    //   )
        }
      })
      modalRef.componentInstance.onUpdateEstatusHuesped.subscribe({
        next:(huesped:Huesped)=>{
          this.submitLoading=true;
          this._huespedService.updateEstatusHuesped(huesped).subscribe(
            {
              next:(val)=>{
                this.promptMessage('Exito','Datos del huesped Actualizados');
              },
              error:(error)=>{
                this.promptMessage('Error','Error al Guardar Promesa de Pago');
                this.promesasDisplay=false
              },
              complete:()=>{
                this.submitLoading=false;
              }
            })
        }
      })
      modalRef.componentInstance.houseKeepingCodes = this.houseKeepingCodes
      modalRef.result.then((result) => {
        if(result) {
          console.log(result);
        }else
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }
  }

  async onResizeReservation(event:Record<string, any>){
    console.log("MAIN CONTAINER:",event);

    const dataSource = await this.roomRates(event.Codigo);
    const tarifaEstandarArray = dataSource.filter((item)=>item.Tarifa === 'Tarifa Estandar');

    let Difference_In_Time = event.EndTime.getTime() - event.StartTime.getTime();
    this.stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

    const modalRef = this.modalService.open(WarningComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.dataSource = dataSource
    modalRef.componentInstance.stayNights = this.stayNights
    modalRef.componentInstance.StartTime = event.StartTime
    modalRef.componentInstance.EndTime = event.EndTime
    modalRef.componentInstance.tarifaEstandarArray = tarifaEstandarArray
    modalRef.componentInstance.cuarto = event.Codigo
    modalRef.componentInstance.folio = event.Folio    
    modalRef.componentInstance.numeroCuarto = event.Numero
    modalRef.componentInstance.alertHeader = "Advertencia"
    modalRef.componentInstance.mensaje= "Al cambiarse la fecha de la reservacion es nesesario confirmar la tarifa que se utilizara para la misma"  
    modalRef.result.then((result) => {
      if(result) {
        this.onChangedRate(result);
      }else
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  onChangedRate(data:any){
    
    this._huespedService.updateReserva(data).subscribe({
      next:(data)=>{
        console.log(data);
        this.promptMessage('Exito','Reservacion actualizada con exito');
      },
      error:()=>{
        this.promptMessage('Error','No se pudo actualizar la nueva fecha vuelva intentarlo')
      },
      complete:()=>{
        this.submitLoading=false
      }
    })
  }

  async roomRates(minihabs:string){
    const tarifasDisponibles = await this.checkRatesIndexDB();

    let availbleRates = tarifasDisponibles.filter((item) => item.Estado === true); 

    availbleRates  = availbleRates.filter(obj =>
      obj.Habitacion.some(item => item === minihabs));
    return availbleRates
  }

  async checkRatesIndexDB(){
    const ratesIndexDB:Tarifas[] = await this._habitacionService.readIndexDB("Rates");

    /** Checks if RatesArray is on IndexDb */
    if(ratesIndexDB){
      return ratesIndexDB
    }else {
      return  await firstValueFrom(this._tarifasService.getAll());
    }
  }

  openEnviarReservacion(){
    const modalRef=this.modalService.open(this.emailModal,{ size: 'md', backdrop:'static' })
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  onOpenModifica(huesped:any){
    // const modalRef = this.modalService.open(ModificaHuespedComponent,{ size: 'md', backdrop:'static' })
    // modalRef.componentInstance.huesped = this.huesped;

    // modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {

    //   //Recibir Data del Modal usando EventEmitter
    //   this.huesped=receivedEntry;

    //   const ano = this.huesped.llegada.split("/")[2]
    //   const mes = this.huesped.llegada.split("/")[1]
    //   const dia = this.huesped.llegada.split("/")[0]

    //   const anoS = this.huesped.salida.split("/")[2]
    //   const mesS = this.huesped.salida.split("/")[1]
    //   const diaS = this.huesped.salida.split("/")[0]

    //   const fromDate = DateTime.fromObject({day:dia,month:mes,year:ano});


    //   if(fromDate.day==this.todayDate.day && fromDate.month==this.todayDate.month && fromDate.year==this.todayDate.year )
    //   {this.llegaHoy=false}
    //   else 
    //   {this.llegaHoy=true}

    //   this.customerService.fetch(sessionStorage.getItem("HOTEL"))
    //   })
      
    //   //Recibir Data del Modal usando modal.close(data)

    //  modalRef.result.then((result) => {
    //     if (result) {
    //     this.huesped=result
    //       this.formatFechas();
    //     console.log("modal.close():", result);
    //     }
    //     });

    // modalRef.result.then((result) => {
    //   this.closeResult = `Closed with: ${result}`;
    //   }, (reason) => {
    //       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //   });

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
                  const promesasPagoList=[]

                  console.log(dateObject)

                  if(result[i].Aplicado==false)
                  {

                    colorAplicado='#f7347a'//rosa
                    color='#68B29A'
                    if(dateObject.millisecond<todayMillis)
                    {
                      let status = 'Expirado'
                      expirado='Expirado'
                      color='#D47070'//rosa
                      const _id= result[i]._id!
                      this._promesasService.updatePromesaEstatus(_id,status).subscribe()
                    }

                    if(dateObject.millisecond>todayMillis)
                    {
                      expirado='Vigente'
                      color='#68B29A'//verde
                    }

                    promesasPagoList[i] = {
                      _id:result[i]._id,
                      Fecha:result[i].Fecha.toString().split('T')[0],
                      Cantidad:result[i].Cantidad,
                      Expirado:expirado,
                      Aplicado:result[i].Aplicado,
                      Color:color,
                      ColorAplicado:colorAplicado,
                      Estatus:result[i].Estatus
                    }

                  }else if(result[i].Aplicado==true)
                  
                  {
                    expirado=result[i].Estatus

                      color='#0A506A'//Azul 
                      colorAplicado='#0A506A'//Azul 

                  
                      promesasPagoList[i] = {
                      _id:result[i]._id,
                      Fecha:result[i].Fecha.toString().split('T')[0],
                      Cantidad:result[i].Cantidad,
                      Expirado:expirado,
                      Aplicado:result[i].Aplicado,
                      Color:color,
                      ColorAplicado:colorAplicado,
                      Estatus:result[i].Estatus
                    }
                  }
                  this.changingPromesasValue.next(promesasPagoList);
                }
}

  promptMessage(header:string,message:string, obj?:any){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje= message    
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      setTimeout(() => {
        modalRef.close('Close click');
      },4000)
      return
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
