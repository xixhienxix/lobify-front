/* eslint-disable @angular-eslint/no-output-on-prefix */

import { Component, EventEmitter,Input,  OnDestroy,  OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Internationalization, setCulture } from '@syncfusion/ej2-base';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import {
  ScheduleComponent, DragAndDropService, TimelineViewsService, GroupModel, EventSettingsModel, ResizeService, View, TimelineMonthService, WorkHoursModel, RenderCellEventArgs, TimeScaleModel, ActionEventArgs,
  DragEventArgs,
  EventRenderedArgs,
  ResizeEventArgs
} from '@syncfusion/ej2-angular-schedule';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { loadCldr,L10n } from '@syncfusion/ej2-base';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { HouseKeeping } from '../../_models/housekeeping.model';

import { Bloqueo } from 'src/app/_metronic/layout/components/header/bloqueos/_models/bloqueo.model';
import frNumberData from "@syncfusion/ej2-cldr-data/main/es-MX/numbers.json";
import frtimeZoneData from "@syncfusion/ej2-cldr-data/main/es-MX/timeZoneNames.json";
import frGregorian from "@syncfusion/ej2-cldr-data/main/es-MX/ca-gregorian.json";
import frNumberingSystem from "@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json";
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import { TarifasService } from 'src/app/services/tarifas.service';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { DateTime } from 'luxon'
import { BloqueoService } from 'src/app/services/bloqueo.service';

loadCldr(frNumberData, frtimeZoneData, frGregorian, frNumberingSystem);

L10n.load({
  "es-MX": {
    "schedule": {
      "day": "Día",
      "week": "Semana",
      "workWeek": "Semana laboral",
      "month": "Mes",
      "year": "Año",
      "agenda": "Agenda",
      "weekAgenda": "Agenda de la semana",
      "workWeekAgenda": "Agenda de la semana laboral",
      "monthAgenda": "Agenda del mes",
      "today": "Hoy",
      "noEvents": "No hay eventos",
      "emptyContainer": "No hay eventos programados para este día.",
      "allDay": "Todo el dia",
      "start": "Inicio",
      "end": "Fin",
      "more": "más",
      "close": "Cerrar",
      "cancel": "Cancelar",
      "noTitle": "(Sin título)",
      "delete": "Borrar",
      "deleteEvent": "Este evento",
      "deleteMultipleEvent": "Eliminar Varios eventos",
      "selectedItems": "Elementos seleccionados",
      "deleteSeries": "Serie completa",
      "edit": "Editar",
      "editSeries": "Serie completa",
      "editEvent": "Este evento",
      "createEvent": "Crear",
      "subject": "Asunto",
      "addTitle": "Añadir título",
      "moreDetails": "Más detalles",
      "moreEvents": "Más eventos",
      "save": "Guardar",
      "editContent": "¿Cómo te gustaría cambiar la cita en la serie?",
      "deleteContent": "¿Está seguro de que desea eliminar este evento?",
      "deleteMultipleContent": "¿Estás seguro de que deseas eliminar los eventos seleccionados?",
      "newEvent": "Nuevo evento",
      "title": "Título",
      "location": "Ubicación",
      "description": "Descripción",
      "timezone": "Zona horaria",
      "startTimezone": "Iniciar zona horaria",
      "endTimezone": "Fin de la zona horaria",
      "repeat": "Repetir",
      "saveButton": "Guardar",
      "cancelButton": "Cancelar",
      "deleteButton": "Eliminar",
      "recurrence": "Repetición",
      "wrongPattern": "El patrón de recurrencia no es válido.",
      "seriesChangeAlert": "¿Desea cancelar los cambios realizados en instancias específicas de esta serie y volver a compararlos con toda la serie?",
      "createError": "La duración del evento debe ser más corta que la frecuencia con la que ocurre. Acorte la duración o cambie el patrón de periodicidad en el editor de eventos de periodicidad.",
      "sameDayAlert": "Dos ocurrencias del mismo evento no pueden ocurrir en el mismo día.",
      "occurenceAlert": "No se puede reprogramar una aparición de la cita periódica si omite una aparición posterior de la misma cita.",
      "editRecurrence": "Editar periodicidad",
      "repeats": "Repite",
      "alert": "Alerta",
      "startEndError": "La fecha de finalización seleccionada se produce antes de la fecha de inicio.",
      "invalidDateError": "El valor de la fecha ingresada no es válido.",
      "blockAlert": "Los eventos no se pueden programar dentro del rango de tiempo bloqueado.",
      "ok": "De acuerdo",
      "of": "de",
      "yes": "si",
      "no": "No",
      "occurrence": "Ocurrencia",
      "series": "Serie",
      "previous": "Anterior",
      "next": "próximo",
      "timelineDay": "Por Día",
      "timelineWeek": "Por Semana",
      "timelineWorkWeek": "Cronograma Semana Laboral",
      "timelineMonth": "Por Mes",
      "timelineYear": "Cronología Año",
      "editFollowingEvent": "Siguientes eventos",
      "deleteTitle": "Eliminar evento",
      "editTitle": "Editar evento",
      "beginFrom": "Comenzar desde",
      "endAt": "Fin en",
      "expandAllDaySection": "Expandir la sección de todo el día",
      "collapseAllDaySection": "Contraer sección de todo el día",
      "searchTimezone": "Zona horaria de búsqueda",
      "noRecords": "No se encontraron registros",
      "deleteRecurrenceContent": "¿Está seguro de que desea eliminar solo este evento o la serie completa?",
      "recurrenceDateValidation": "Algunos meses tienen menos días a la fecha seleccionada. Para estos meses la ocurrencia de los eventos será en el ultimo día del mes."
    },
    "recurrenceeditor": {
      "none": "Ninguna",
      "daily": "Diario",
      "weekly": "Semanal",
      "monthly": "Mensual",
      "month": "Mes",
      "yearly": "Anual",
      "never": "Nunca",
      "until": "Hasta",
      "count": "Contar",
      "first": "Primero",
      "second": "Segundo",
      "third": "Tercero",
      "fourth": "Cuarto",
      "last": "Último",
      "repeat": "Repetir",
      "repeatEvery": "Repite cada",
      "on": "Repetir en",
      "end": "Final",
      "onDay": "Día",
      "days": "Día(s)",
      "weeks": "Semana(s)",
      "months": "Mes(es)",
      "years": "Año(s)",
      "every": "cada",
      "summaryTimes": "vece(s)",
      "summaryOn": "en",
      "summaryUntil": "hasta",
      "summaryRepeat": "Repite",
      "summaryDay": "día(s)",
      "summaryWeek": "semana(s)",
      "summaryMonth": "mes(es)",
      "summaryYear": "año(s)",
      "monthWeek": "Mes Semana",
      "monthPosition": "Posición del mes",
      "monthExpander": "Expansor de mes",
      "yearExpander": "Expansor de año",
      "repeatInterval": "Intervalo de repetición"
    },
    "calendar": {
      "today": "Hoy"
    },
  }
});

setCulture('es-MX');
@Component({
    selector      : 'app-content',
    templateUrl   : './content.component.html',
    styleUrls     : ['./content.component.scss'],
    encapsulation : ViewEncapsulation.None,
    providers: [TimelineViewsService, TimelineMonthService, ResizeService, DragAndDropService],
})

export class ContentComponent implements OnInit{
  fareValue=900;
  datasourceArray :Record<string, any>[]=[]
  reservationsArray:Huesped[];
  bloqueosArray:Bloqueo[];

  public scheduleView: View = 'Month';

  isInitialized = false;
  @Input() currentParametros:Parametros

  @Input() allReservations:Huesped[];

  closeResult:string
  public selectedDate: Date = new Date();
  todayDate = new Date();
  public timeScale: TimeScaleModel = { enable: true, interval: 1440, slotCount: 1 };
  /**
   * Used to Set how many days displays on the Scheduler in one view
   */
  public dayInterval: number = 12;
  /**
   * Specify WorkDays, non workdays appear as gray columns on the schedule
   */
  public workDays: number[] = [0, 1, 2, 3, 4, 5, 6 ,7];
  /**
   * Display Days in Specific format
   */
  public instance: Internationalization = new Internationalization();
  getDateHeaderText: Function = (value: Date) => {
      return this.instance.formatDate(value, { skeleton: 'MMMd' });
  };

  public datas: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  public scheduleinterval = 7;

  public rowAutoHeight = true;
  public currentView: View = 'TimelineDay';
  public allowMultiple:boolean = true;
  public group: GroupModel = {
    resources: ['Type', 'Rooms'],enableCompactView: false
  };

  public data: DataManager = new DataManager({
    url: environment.apiUrl+'/version',
    adaptor:new UrlAdaptor(),
    crossDomain:true
  })


  public workHours: WorkHoursModel = { start: '08:00', end: '18:00' };

  /**
   * This Object initialize the RoomTypes, it cannot be initialize as an empty array or it will trigger a error
   * Color property is required otherwise it wont render the roomtypes
   * @type {Record<string, any>[]}
   * @memberof ContentComponent
   */
  public resourceDataSource: Record<string, any>[]= [];

  public eventSettings: EventSettingsModel = {
    dataSource: this.resourceDataSource
  };

  /**Data Models */
  colorDict={
    0:'#a6e390',
    1:'#fab3db',
    2:'#d0aaec',
    3:'#ffce54',
    4:'#fb7f8c',
    5:'#808080'

    //#fab3db - Reserva Temporal
    //#d0aaec - Reserva Uso Temporal
    //#ffce54 - Reservacion
  }

  checkInTime: any
  checkOutTime: any



  @Input() tipoHabGroupDataSource: Record<string, any>[]
  @Input() habitacionPorTipoDataSource: Record<string, any>[]
  @Input() changing: Subject<any[]>;
  @Input() roomCodesComplete:any[];
  @Input() roomCodes:Habitacion[];
  @Input() ratesArrayComplete:Tarifas[];
  @Input() estatusArray:HouseKeeping[];

  @Output() onResizeReserva: EventEmitter<Record<string, any>> = new EventEmitter();
  @Output() honEditRsv: EventEmitter<any> = new EventEmitter();
  @Output() honDeleteBloqueo: EventEmitter<any> = new EventEmitter();
  @Output() onChangeEstatus: EventEmitter<any> = new EventEmitter();
  @Output() onRefreshingFinished: EventEmitter<boolean> = new EventEmitter();
  @Output() honNvaRsvDateRange: EventEmitter<any> = new EventEmitter();
  @Output() honRefreshCalendar: EventEmitter<boolean> = new EventEmitter();

  @ViewChild("scheduleObj") public scheduleObj: ScheduleComponent;

  
  constructor(
    private modalService:NgbModal,
    private activatedRoute: ActivatedRoute,
    private _roomService: HabitacionesService,
    private _indexDBService: IndexDBCheckingService,
    private _tarifasService: TarifasService,
    private _parametrosService: ParametrosService,
    private _bloqueosService: BloqueoService
  ) {
    this.selectedDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate())
    this.activatedRoute.data.subscribe((val) => {
      this.createRack(val.data);
    });
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
  }

  getDailyRates(event:any, codigoPorParametro?:string){

    const rowData = this.getRowData(event.groupIndex);
    const numeroCuarto = rowData.resourceData.text;
    const codigoCuarto = this.roomCodesComplete.find(item => item.Numero === numeroCuarto)?.Codigo; 

    const baseRate = this.ratesArrayComplete.find(obj =>
      obj.Habitacion.some((item) => 
        {
          if(!codigoCuarto){
            return item === codigoPorParametro
          }else {
            return item === codigoCuarto
          }
        }));

      if(baseRate!== undefined && ((codigoCuarto !== undefined) || (codigoPorParametro !== undefined)) ){
        const tarifasPorDia = this._tarifasService.ratesTotalCalc(
          baseRate,
          this.ratesArrayComplete.filter(item => item.Tarifa === 'Tarifa Base'),
          this.ratesArrayComplete.filter(item => item.Tarifa === 'Tarifa De Temporada'),
          codigoCuarto !== undefined ? codigoCuarto : codigoPorParametro, // Assuming single room per rate
          1,
          0,
          this._parametrosService.convertToCorrectTimezone(event.date),
          this._parametrosService.convertToCorrectTimezone(event.date,true),
          1
        );

        const result = Array.isArray(tarifasPorDia) ? tarifasPorDia[0]?.tarifaTotal ?? 0 : tarifasPorDia ?? 0
        const returningValue = (result).toLocaleString('es-MX',{ style: 'currency', currency: 'MXN',minimumFractionDigits: 0,
          maximumFractionDigits: 0, })
        return returningValue
      }
      else {
        return ' '
      }
  }

  adjustTime (date: string, time: { hours: number; minutes: number }): Date  {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(time.hours, time.minutes, 0, 0);
    return adjustedDate;
  };

  async ngOnInit() {

    await this.checkRoomCodesIndexDB();
    this._indexDBService.checkIndexedDB(['tarifas'],true);
    this.ratesArrayComplete = await this._indexDBService.loadTarifas(true);

    this._bloqueosService.getBloqueoResponse.subscribe({
      next:(value)=>{
        if(value){
          this.honRefreshCalendar.next(true);
        }
      }
    })
    // this.currentParametros = await this._indexDBService.loadParametros(true);

    this.changing.subscribe((dataSource: any) => {
      this.datasourceArray = [];
      this.reservationsArray = [];
      this.bloqueosArray = [];
  
      this.checkInTime = this.parseTime(this.currentParametros.checkIn);
      this.checkOutTime = this.parseTime(this.currentParametros.checkOut);
  
      const adjustTime = (date: string, time: { hours: number; minutes: number }): Date => {
        const adjustedDate = new Date(date);
        adjustedDate.setHours(time.hours, time.minutes, 0, 0);
        return adjustedDate;
      };
  
      const getCategoryColor = (estatus: string): string => {
        const colorMap: Record<string, string> = {
          'Huesped en Casa': this.colorDict[0],
          'Reserva Sin Pago': this.colorDict[3],
          'Reserva Confirmada': this.colorDict[3],
          'Deposito Realizado': this.colorDict[3],
          'Esperando Deposito': this.colorDict[3],
          'Totalmente Pagada': this.colorDict[3],
          'Hizo Checkout': this.colorDict[4],
          'Uso Interno': this.colorDict[2],
          'Bloqueo': this.colorDict[3],
          'Reserva Temporal': this.colorDict[1],
          'No Show': this.colorDict[4],
          'Check-Out': this.colorDict[4],
          'Reserva Cancelada': this.colorDict[4],
          'Walk-In': this.colorDict[0],
          'Reserva en Casa': this.colorDict[0],
          'Reserva': this.colorDict[3],
          default: this.colorDict[0],
        };
  
        return colorMap[estatus] || colorMap['default'];
      };
  
      let reservasIdCounter = 1;
  
      // Process Reservations
      dataSource.value.forEach((item: Huesped) => {
        this.reservationsArray.push(item);
  
        if (!reservationStatusMap[8].includes(item.estatus)) {
          const llegada = this.adjustTime(item.llegada, this.checkInTime);
          const salida = this.adjustTime(item.salida, this.checkOutTime);

          this.datasourceArray.push({
            Id: reservasIdCounter++,
            Subject: item.nombre,
            StartTime: llegada,
            EndTime: salida,
            IsAllDay: false,
            ProjectId: this.checkGroupId(item.habitacion, item.numeroCuarto),
            TaskId: this.checkTaskID(item.numeroCuarto),
            Folio: item.folio,
            Codigo: item.habitacion,
            Numero: item.numeroCuarto,
            CategoryColor: getCategoryColor(item.estatus),
            Rate:item.tarifa,
            Saldo: item.pendiente
          });
        }
      });
  
  
      let bloqueoIdCounter = 0;
  
      // Process Bloqueos
      dataSource.bloqueosArray.forEach((item: any) => {
        this.bloqueosArray.push(item);
  
        const llegada = this.adjustTime(item.Desde, this.checkInTime);
        const salida = this.adjustTime(item.Hasta, this.checkOutTime);
  
        if(item.Completed !== true){
          item.Cuarto.forEach((numCuarto: string) => {
            this.datasourceArray.push({
              _id: item._id,
              Id: bloqueoIdCounter++,
              Subject: 'Bloqueo',
              StartTime: llegada,
              EndTime: salida,
              IsAllDay: true,
              ProjectId: this.checkGroupId(item.Habitacion, numCuarto),
              TaskId: this.checkTaskID(numCuarto),
              Folio: `B-${bloqueoIdCounter}`, // Unique folio for bloqueos
              Codigo: item.Habitacion,
              Numero: numCuarto,
              CategoryColor: this.colorDict[5],
            });
          });
        }
      });
    
      // Refresh Calendar
      this.refreshCalendar(this.datasourceArray);
    });
    this.isInitialized = true;
  }
  

  parseTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return { hours, minutes };
  }

  refreshCalendar(datasource:Record<string, any>[]){
      this.scheduleObj.eventSettings.dataSource = [...datasource]
      this.scheduleObj.refresh();
      this.onRefreshingFinished.emit(true);
    
  }

  checkGroupId(codigo:string,cuarto:string){
    const habitacionesPorTipo = this.roomCodesComplete.find(item=>item.Codigo === codigo && item.Numero === cuarto );
    const foundGroupID = this.tipoHabGroupDataSource.find(item=>item.text === habitacionesPorTipo?.Codigo);
    return foundGroupID?.id
  }

  checkTaskID(numero:string){
    const foundTaskID = this.habitacionPorTipoDataSource.find(item=>item.text === numero);
    return foundTaskID?.id
  }

  getNumeroByTaskID(taskID: string) {
    // Find the task by its ID
    const task = this.habitacionPorTipoDataSource.find(item => item.id === taskID);
  
    // If found, return the `numero` (text property)
    return task ? task.text : null;
  }

  createRack(responseData:Habitacion[]){
    const tipoArray:Record<string, any>[] = []
    const codigoArray:Record<string, any>[] = []

    const tipoCuarto = [...new Set(responseData.map(item => item.Codigo))]; // Define the Group property
    // const codigoCuarto = [...new Set(responseData.map(item => item.Numero))];

    tipoCuarto.forEach((_item,index)=>{
      tipoArray.push({ text: tipoCuarto[index].replace(/_/g, " "), id:index+1, color:'#' + Math.floor(Math.random()*16777215).toString(16) });
    }) 
    // HERE THE GROUPS ARE CREATED
    this.tipoHabGroupDataSource = tipoArray;

    for(const key in responseData)
    {
      if(responseData.hasOwnProperty(key))
        {  
          for(let x=0; x<tipoArray.length; x++){
            if(tipoArray[x].text === responseData[key].Codigo.replace(/_/g, " ")){
              if(tipoArray[x].id)
              codigoArray.push({ text: responseData[key].Numero , id:Number(key)+1, groupId: tipoArray[x].id, color: tipoArray[x].color}); 
            }
          }
        }
    }
     this.habitacionPorTipoDataSource = codigoArray
  }

  onChange(args: ChangeEventArgs|any): void {
    this.scheduleObj.rowAutoHeight = args.checked;

    //Used Change Day Vie Interval Dynamicaly with dropdown
    (this.scheduleObj.views[0] as any).interval = this.scheduleinterval;
    this.scheduleObj.refresh();
  }

  /**
  * Event that triggers when popup add event window triggers, and lets you interact with popup
  * @param args This functions is to fill the dropdown of Time that appears whenever yo create or modifiy and existing reservation
  */
  onPopupOpen = async (args: any) => {
    args.cancel = true; // Default cancel
  
    const today = new Date();
    const startTime = new Date(args.data.StartTime);
    const endTime = new Date(args.data.EndTime);
    const existingEvents = this.scheduleObj.getEvents();
  
    let numeroCuarto: string;
    let codigoCuarto: string;
  
    if (this.scheduleObj.activeCellsData.element !== undefined) {
      const cellDetails = this.scheduleObj.getCellDetails(this.scheduleObj.activeCellsData.element);
      const rowData2 = this.scheduleObj.getResourcesByIndex(cellDetails.groupIndex!);
      numeroCuarto = rowData2.resourceData.text;
    } else {
      numeroCuarto = args.data.Numero;
    }
  
    codigoCuarto = this.roomCodesComplete.find(item => item.Numero === numeroCuarto)?.Codigo;
  
    // If event is "Bloqueo", trigger delete event and exit.
    if (args.data.Subject === "Bloqueo") {
      this.honDeleteBloqueo.emit({ row: args, folio: args.data.Folio });
      return;
    }

    const startDateOnly = new Date(startTime);
    startDateOnly.setHours(0, 0, 0, 0);

    const endDateOnly = new Date(endTime);
    endDateOnly.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date(today);
    todayDateOnly.setHours(0, 0, 0, 0);
  
    // If event is in the future or today
    if (startDateOnly >= todayDateOnly || endDateOnly >= todayDateOnly) {
      if (args.data.hasOwnProperty("Folio")) {
        // Editing an existing reservation
        if (args.type === "Editor" || args.type === "QuickInfo") {
          this.honEditRsv.emit({ row: args, folio: args.data.Folio });
        }
      } else if (args.type === "QuickInfo") {
        const now = new Date();
        const filteredEvents = existingEvents.filter(event => new Date(event.EndTime) >= now);

              const parametros = await this._indexDBService.loadParametros();
              const [checkInHour, checkInMinute] = parametros.checkIn.split(':').map(Number);
              const [checkOutHour, checkOutMinute] = parametros.checkOut.split(':').map(Number);
              const timeZone = parametros.codigoZona || 'UTC';

              const argsStart = DateTime
              .fromJSDate(new Date(args.data.StartTime), { zone: timeZone })
              .set({ hour: checkInHour, minute: checkInMinute });
        
            const argsEnd = DateTime
              .fromJSDate(new Date(args.data.EndTime), { zone: timeZone })
              .minus({ days: 1 })
              .set({ hour: checkOutHour, minute: checkOutMinute });

          // Early exit if no events to compare
          if (filteredEvents.length === 0) {
            args.data.endTime = argsEnd.toJSDate();
            args.data.EndTime = argsEnd.toJSDate();
            this.honNvaRsvDateRange.emit({ data: args.data, numeroCuarto, codigoCuarto });
            return;
          }

        // Map and await all async overlap checks
        const overlapResults = await Promise.all(
          filteredEvents.map(async (event) => {
        
            if (event.ProjectId === args.data.ProjectId && event.TaskId === args.data.TaskId) {
              const eventStart = DateTime.fromJSDate(new Date(event.StartTime), { zone: timeZone });
              const eventEnd = DateTime.fromJSDate(new Date(event.EndTime), { zone: timeZone });
        
              const isSameDay = argsStart.hasSame(argsEnd, 'day');
              if (isSameDay) {
                return { overlap: true, argsStart, argsEnd };
              }
        
              const overlap = argsStart <= eventEnd && argsEnd >= eventStart;
              return { overlap, argsStart, argsEnd };
            }
        
            // Always include argsStart and argsEnd, even if Project/Task ID don't match
            return { overlap: false, argsStart, argsEnd };
          })
        );
        
      
        const hasOverlap = overlapResults.some(r => r.overlap);
        // Get first valid transformed values if needed
        const validArgs = overlapResults.find(r => r.argsStart && r.argsEnd);

         if (!hasOverlap && validArgs) {
          args.data.endTime = validArgs?.argsEnd?.toJSDate() ?? new Date(args.data.endTime);
          args.data.EndTime = validArgs?.argsEnd?.toJSDate() ?? new Date(args.data.EndTime);
               
          this.honNvaRsvDateRange.emit({ data: args.data, numeroCuarto, codigoCuarto });
        }
      }
    }
  };
  

  setCheckInOutTimeParametros(date:Date, time:string){
    // Convert to Luxon DateTime
    let luxonDate = DateTime.fromJSDate(date);

    // Time string
    const checkInTime = time;

    // Extract hours and minutes from the string
    const [hour, minute] = checkInTime.split(':').map(Number); // Converts to numbers

    // Update the Luxon DateTime with the extracted time
    luxonDate = luxonDate.set({ hour, minute, second: 0 });

    // If needed, convert back to a native Date object
    return luxonDate.toJSDate();
  }

  onMovileActionBegin(args:any){
    if (args.requestType === 'toolbarItemRendering') {
      this.scheduleObj.element.classList.remove('e-device');
      this.scheduleObj.isAdaptive = false;
    }
  }
  
  /**
   * This function shows how to move a reservation in an estimated time of minutes, the interval parameter determines how many in how many minutes the event will be moved when you drag it across the calendar
   *
   * @param {DragEventArgs} args
   * @memberof ContentComponent
   */
  onDragStart(args: DragEventArgs): void {
    if(args.data.Subject === 'Bloqueo'){
      args.cancel = true;
    }else{
      args.interval = 30;    
    }
  }

  getRowData(groupIndex:number){
    return  this.scheduleObj.getResourcesByIndex(groupIndex!);
  }

  onDragStop(args: DragEventArgs): void {
      const target = args.event.target as HTMLElement;
      const existingEvents = this.scheduleObj.getEvents();

      //const bloqueosOverlap = this.findOverlappingObjects(args.data, bloqueos)//this.bloqueosArray
      const overlapping = this.findOverlappingObjects(args.data,existingEvents); // existingEvents

      if(overlapping.length === 0 ){
        if (target.classList.contains('e-header-cells')) { // Avoid the drag event to be left on header Cells
          args.cancel = true;
        } else{
          //this.onResizeReserva.emit(args.data) // <-- This data is from where the event start  and i need the data to which is moved to
          const scheduleObj = (document.querySelector('.e-schedule') as any).ej2_instances[0];
          const targetElement:any = args.target;
          const rowIndex = targetElement!.parentNode!.rowIndex;
          const resourceDetails = scheduleObj.getResourcesByIndex(rowIndex);
          const Codigo = this.roomCodesComplete.find((item)=> item.Numero === resourceDetails.resourceData.text)?.Codigo
          args.data.Codigo = Codigo
          args.data.Numero = resourceDetails.resourceData.text
          if(args.data.Codigo !== undefined || args.data.Numero !== undefined){
            this.onResizeReserva.emit(args.data);
          }else{
            args.cancel = true;
          }
        }
      }
  args.cancel = true;
  }

  onRenderCell(args: RenderCellEventArgs): void {
    let filteredData: any;
    if (args.elementType == 'resourceGroupCells' ) {
      
        const dataSource = Object.values(this.scheduleObj.eventSettings.dataSource!);
        filteredData = dataSource.filter((data: any) => {
            const dataDate = new Date(data.StartTime);
            const argsDate = new Date(args.date!);
            dataDate.setHours(0, 0, 0, 0);
            argsDate.setHours(0, 0, 0, 0);
            let argsGroupIndex = this.scheduleObj.getResourcesByIndex(args.groupIndex!);
             return data.ProjectId === argsGroupIndex.groupData!.ProjectId && dataDate.getTime() == argsDate.getTime(); 
        });
        (args.element as HTMLElement).innerText = filteredData.length.toString();
  }
  if (
    (this.currentView === 'TimelineMonth' || this.currentView === 'TimelineDay') &&
    args.element.classList.contains('e-work-cells') &&
    args.date instanceof Date // ensures args.date is not undefined and is a Date
  ) {
    const day = args.date.getDay(); // 0 = Sunday, 6 = Saturday

    if (day === 0 || day === 6) {
      args.element.classList.add('weekend-cell');
    }
  }
}

findOverlappingObjects(
  target: Record<string, any>,
  objects: Record<string, any>[],
): Record<string, any>[] {
  const checkInDate = new Date(this.setCheckInOutTimeParametros(target.StartTime, this.currentParametros.checkIn));
  const checkOutDate = new Date(this.setCheckInOutTimeParametros(target.EndTime, this.currentParametros.checkOut));

  // Utility function to strip time and leave only the date part
  const stripTime = (date: Date): Date => {
    const strippedDate = new Date(date);
    strippedDate.setHours(0, 0, 0, 0);
    return strippedDate;
  };

  return objects.filter((obj: Record<string, any>) => {
    // Avoid returning the same object as the target
    if (obj.Id === target.Id) {
      return false;
    }

    const numCuarto = this.getNumeroByTaskID(target.TaskId);
    
    // Make sure to parse the object's start and end times
    const objStart = new Date(obj.StartTime);
    const objEnd = new Date(obj.EndTime);

    let dateOverlap;

    if (obj.Folio.startsWith('B')) {

      // Strip the time part from dates for comparison
      const checkInDateStripped = stripTime(checkInDate);
      const checkOutDateStripped = stripTime(checkOutDate);
      const objStartStripped = stripTime(objStart);
      const objEndStripped = stripTime(objEnd);

      // Logic for overlapping with boundary handling (without time)
      dateOverlap =
        (checkInDateStripped.getTime() === objStartStripped.getTime()) || // Check if checkInDate is the same as objStartStripped
        (checkInDateStripped.getTime() === objEndStripped.getTime()) || // Check if checkInDate is the same as objEndStripped
        (checkInDateStripped >= objStartStripped && checkInDateStripped <= objEndStripped) || // Check if checkInDate is between objStartStripped and objEndStripped
        (checkOutDateStripped >= objStartStripped && checkOutDateStripped <= objEndStripped) || // Check if checkOutDate is between objStartStripped and objEndStripped
        (checkInDateStripped <= objStartStripped && checkOutDateStripped >= objEndStripped) || // Check if target range fully encompasses the object range
        (checkInDateStripped <= objEndStripped && checkOutDateStripped >= objStartStripped); // Check if any part of the target range overlaps the object range
    } else {

      // Check for overlapping dates considering both date and time
      dateOverlap =
        (objStart <= checkOutDate && objStart >= checkInDate) || // Start time falls within the range
        (objEnd <= checkOutDate && objEnd >= checkInDate) || // End time falls within the range
        (objStart <= checkInDate && objEnd >= checkOutDate); // The range is fully enclosed
    }

    // Match the room numbers
    const roomMatch = obj.Numero === numCuarto // Checking if room number matches

    // Return true only if both date overlap and room match conditions are satisfied
    return dateOverlap && roomMatch;
  });
}

  isChildNode(data: any): boolean {
    return data.resourceData.ClassName !== "e-parent-node";
  }

  onDataBound(){

  const workCells = document.querySelectorAll(".e-work-cells.e-resource-group-cells");
  workCells.forEach((cell, index) => {
      let projectEvents = [];    
      const timestamp = Number(cell.getAttribute('data-date'));
      const startDate = new Date(timestamp);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // add one day
      const events = this.scheduleObj.getEvents(startDate, endDate);
      const cellProjectId = this.scheduleObj.getResourcesByIndex(Number(cell.getAttribute("data-group-index"))).groupData!.ProjectId; 
      const groupIndex = Number(cell.getAttribute("data-group-index"));       
      //Header of avaibility
        events.forEach(event => {
            if (event.ProjectId === cellProjectId) {
                projectEvents.push(event);
            } 
        });
        const totalChildResources = this.habitacionPorTipoDataSource.filter(category => category.groupId === cellProjectId).length;
        const emptyChildResources = totalChildResources - projectEvents.length;
        (cell as HTMLElement).innerText = emptyChildResources.toString();

        //Code Block for Rates on grouping column
        // this.ratesArrayComplete.map((item) => {
        //   if(item.Tarifa === 'Tarifa De Temporada'){
        //     return item.TarifaRack
        //   }
        // });
        const eventObj = {
          groupIndex:groupIndex,
          date: DateTime.fromMillis(timestamp, { zone: this.currentParametros.codigoZona }).toISO()

        }
        const resourses = this.scheduleObj.getResourcesByIndex(groupIndex);
        const fareValue = this.getDailyRates(eventObj,resourses.resourceData.text);
        const newElement = document.createElement('div');
        newElement.innerText = fareValue
        newElement.style.marginTop = '10px';
        (cell as HTMLElement).appendChild(newElement);
  });
  }

  getIconClass(text: string) {
    let huesped

    if(this.roomCodesComplete){
      huesped = this.roomCodesComplete.find(item=>
        item.Numero === text
      );
    }

    if(huesped !== undefined){
      // return '../../../../../assets/media/locks/green_Lock.png'
      if(huesped.Estatus === 'LIMPIA'){
        return '../../../../../assets/media/locks/blue_Lock.png'
      }else if(huesped.Estatus === 'LIMPIANDO'){
        return '../../../../../assets/media/locks/yellow_Lock.png'
      }else if(huesped.Estatus === 'SUCIA'){
        return '../../../../../assets/media/locks/red_Lock.png'
      }else if(huesped.Estatus === 'RETOCAR'){
        return '../../../../../assets/media/locks/green_Lock.png'
      }
      else {
        return '../../../../../assets/media/locks/green_Lock.png'
      }
    }
  }


 onActionComplete(args: ActionEventArgs): void {
  if (args.requestType === 'dateNavigate') {
    const selectedDate = this.selectedDate;
      const workCells = this.scheduleObj.element.querySelectorAll('.e-work-cells');
    this.applyStylesToCells(workCells, selectedDate);
    const headerCells = this.scheduleObj.element.querySelectorAll('.e-date-header-wrap .e-header-cells');
    this.applyStylesToCells(headerCells, selectedDate);
  }
  if(args.requestType === 'eventCreated'){
    args.data
  }
}

 applyStylesToCells(cells: NodeListOf<Element>, selectedDate: Date): void {
  cells.forEach((cell: any) => {
    const cellDate = this.scheduleObj.getDateFromElement(cell);
    if (cellDate && cellDate.getDate() === selectedDate.getDate() &&
        cellDate.getMonth() === selectedDate.getMonth() &&
        cellDate.getFullYear() === selectedDate.getFullYear()) {
      cell.style.backgroundColor = 'lightgray';
    } else {
      cell.style.backgroundColor = '';
    }
  });
}


/**
 * This method is used to change the color of each event using its categoryColor
 * @param args 
 * @returns 
 */
onEventRendered(args: EventRenderedArgs): void {
  const categoryColor: string = args.data.CategoryColor as string;
  if (!args.element || !categoryColor) {
    return;
  }
  if (this.currentView === 'Agenda') {
    (args.element.firstChild as HTMLElement).style.borderLeftColor = categoryColor;
  } else {
    args.element.style.backgroundColor = categoryColor;
  }
}

onStatusChange(cuarto:string, estatus:string){
  this.onChangeEstatus.emit({cuarto,estatus})
}

onEditRsv(event:any){
  this.honEditRsv.emit(event);
}

onResizeStart(args: ResizeEventArgs){
  if(args.data.Subject === 'Bloqueo'){
    args.cancel = true
  }
}

onResizeStop(args: ResizeEventArgs){
    this.onResizeReserva.emit(args.data)
}

promptMessage(header:string,message:string){
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
