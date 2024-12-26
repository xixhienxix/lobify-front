import { Injectable } from "@angular/core";
import { AuthService } from "src/app/modules/auth";
import { EstatusService } from "src/app/pages/calendar/_services/estatus.service";
import { FoliosService } from "src/app/pages/calendar/_services/folios.service";
import { ParametrosService } from "src/app/pages/parametros/_services/parametros.service";
import { LogService } from "../activity-logs.service";
import { Edo_Cuenta_Service } from "../edoCuenta.service";
import { HabitacionesService } from "../habitaciones.service";
import { HouseKeepingService } from "../housekeeping.service";
import { HuespedService } from "../huesped.service";
import { TarifasService } from "../tarifas.service";
import { DashboardService } from "./dashboard.service";
import { BloqueoService } from "../bloqueo.service";
import { DisponibilidadService } from "../disponibilidad.service";
import { PromesaService } from "../promesas.service";
import { AdicionalService } from "../adicionales.service";
import { CodigosService } from "../codigos.service";
import { DivisasService } from "src/app/pages/parametros/_services/divisas.service";
import { BehaviorSubject } from "rxjs";
import { Parametros, PARAMETROS_DEFAULT_VALUES } from "src/app/pages/parametros/_models/parametros";
import { HouseKeeping } from "src/app/pages/calendar/_models/housekeeping.model";
import { Bloqueo } from "src/app/_metronic/layout/components/header/bloqueos/_models/bloqueo.model";
import { Estatus } from "src/app/pages/calendar/_models/estatus.model";
import { Habitacion } from "src/app/models/habitaciones.model";
import { ActivityLogs } from "src/app/models/activity-log.model";
import { Promesa } from "src/app/pages/calendar/_models/promesas.model";
import { Huesped } from "src/app/models/huesped.model";
import { Adicional } from "src/app/models/adicional.model";
import { Tarifas } from "src/app/models/tarifas";
import { Codigos } from "src/app/models/codigos.model";
import { Foliador } from "src/app/pages/calendar/_models/foliador.model";

@Injectable({
    providedIn:'root'
})
export class IndexDBCheckingService {
    currentUser:string=''

    private parametrosSubject = new BehaviorSubject<Parametros>(PARAMETROS_DEFAULT_VALUES);
    parametros$ = this.parametrosSubject.asObservable();

    private houseKeepingCodesSubject = new BehaviorSubject<HouseKeeping[]>([]);
    houseKeepingCodes$ = this.houseKeepingCodesSubject.asObservable();

    public bloqueosSubject = new BehaviorSubject<Bloqueo[]>([]);
    bloqueos$ = this.bloqueosSubject.asObservable();

    private estatusSubject = new BehaviorSubject<Estatus[]>([]);
    estatus$ = this.estatusSubject.asObservable();

    private habitacionesSubject = new BehaviorSubject<Habitacion[]>([]);
    habitaciones$ = this.habitacionesSubject.asObservable();

    private logsSubject = new BehaviorSubject<ActivityLogs[]>([]);
    logs$ = this.logsSubject.asObservable();

    private reservacionesSubject = new BehaviorSubject<Huesped[]>([]);
    reservaciones$ = this.reservacionesSubject.asObservable();

    private adicionalesSubject = new BehaviorSubject<Adicional[]>([]);
    adicionales$ = this.adicionalesSubject.asObservable();

    private tarifasSubject = new BehaviorSubject<Tarifas[]>([]);
    tarifas$ = this.tarifasSubject.asObservable();

    private codigosSubject = new BehaviorSubject<Codigos[]>([]);
    codigos$ = this.codigosSubject.asObservable();

    private foliosSubject = new BehaviorSubject<Foliador[]>([]);
    folios$ = this.foliosSubject.asObservable();

    
    constructor(
        private _authService: AuthService,
        private _parametrosService: ParametrosService,
        private _houseKeepingService: HouseKeepingService,
        private _bloqueosServvice: BloqueoService,
        private _estatusService: EstatusService,
        private _habitacionesService: HabitacionesService,
        private _logsService: LogService,
        private _reservacionesService: HuespedService,
        private _serviciosAdicionalesService: AdicionalService,
        private _tarifasService: TarifasService,
        private _codesService: CodigosService,
        private _foliosService: FoliosService,
    ){
    }

    async checkIndexedDB(servicesToCheck: string[], refresh:boolean=false ): Promise<Record<string, any>> {
        const currentUser = this._authService.getcurrentUserValue;
            if (currentUser && currentUser.username) {
            this.currentUser = currentUser.username;
            } else {
            this.currentUser = ''
            }
        const results: Record<string, any> = {}; // Allows dynamic keys
        for (const service of servicesToCheck) {
            if (service === 'parametros') {
              results['parametros'] = await this.loadParametros(refresh);
            } else if (service === 'housekeeping') {
              results['housekeeping'] = await this.loadHouseKeepingCodes(refresh);
            } else if (service === 'bloqueos') {
              results['bloqueos'] = await this.loadBloqueos(refresh);
            } else if (service === 'estatus') {
                results['estatus'] = await this.loadEstatus(refresh);
            } else if (service === 'habitaciones') {
                results['habitaciones'] = await this.loadHabitaciones(refresh);
            } else if (service === 'logs') {
                results['logs'] = await this.loadLogs(refresh);
            } else if (service === 'reservaciones') {
                results['reservaciones'] = await this.loadReservaciones(refresh);
            } else if (service === 'adicionales') {
                results['adicionales'] = await this.loadAdicionales(refresh);
            } else if (service === 'tarifas') {
                results['tarifas'] = await this.loadTarifas(refresh);
            } else if (service === 'codes') {
                results['codes'] = await this.loadCodes(refresh);
            } else if (service === 'folios') {
                results['folios'] = await this.loadFoliador(refresh);
            }
      }
      return results;
    }

    // Helper function to load and manage Parametros data
    async loadParametros(refresh: boolean = false): Promise<Parametros> {
        if (!refresh) {
            const parametrosIndexDB = await this._parametrosService.readIndexDB('Parametros');
            if (parametrosIndexDB) {
                this.parametrosSubject.next(parametrosIndexDB);
                return parametrosIndexDB;
            }
        }
        return new Promise((resolve) => {
            this._parametrosService.getParametros().subscribe((parametros) => {
                this.parametrosSubject.next(parametros);
                this._parametrosService.writeIndexDB('Parametros', parametros);
                resolve(parametros);
            });
        });
    }

    async loadHouseKeepingCodes(refresh: boolean): Promise<HouseKeeping[]> {
        if (!refresh) {
            const housekeeoingcodesIndexDb = await this._houseKeepingService.readIndexDB('HouseKeepingCodes');
            if (housekeeoingcodesIndexDb) {
                this.houseKeepingCodesSubject.next(housekeeoingcodesIndexDb);
                return housekeeoingcodesIndexDb;
            }
        }
        return new Promise((resolve) => {
            this._houseKeepingService.getAll().subscribe((codes) => {
                this.houseKeepingCodesSubject.next(codes);
                this._houseKeepingService.writeIndexDB('HouseKeepingCodes', codes);
                resolve(codes);
            });
        });
    }

    async loadBloqueos(refresh: boolean = false): Promise<Bloqueo[]> {
        if (!refresh) {
            const bloqueosIndexDb = await this._bloqueosServvice.readIndexDB('Bloqueos');
            if (bloqueosIndexDb) {
                this.bloqueosSubject.next(bloqueosIndexDb);
                return bloqueosIndexDb;
            }
        }
        return new Promise((resolve) => {
            this._bloqueosServvice.getAll().subscribe((codes) => {
                this.bloqueosSubject.next(codes);
                this._bloqueosServvice.writeIndexDB('Bloqueos', codes);
                resolve(codes);
            });
        });
    }

    async loadEstatus(refresh: boolean): Promise<Estatus[]> {
        if (!refresh) {
            const estatusIndexDb = await this._estatusService.readIndexDB('Estatus');
            if (estatusIndexDb) {
                this.estatusSubject.next(estatusIndexDb); // Update subject
                return estatusIndexDb;
            }
        }
        return new Promise((resolve) => {
            this._estatusService.getAll().subscribe(codes => {
            this.estatusSubject.next(codes); // Update subject
            this._estatusService.writeIndexDB('Parametros', codes); // Save to IndexedDB
            resolve(codes); // Resolve the promise with the fetched data
            });
        });
        
    }

    async loadHabitaciones(refresh: boolean): Promise<Habitacion[]> {
        if (!refresh) {
            const habitacionesIndexDb = await this._habitacionesService.readIndexDB('Habitaciones');
            if (habitacionesIndexDb) {
                this.habitacionesSubject.next(habitacionesIndexDb);
                return habitacionesIndexDb;
            }
        }
        return new Promise((resolve) => {
            this._habitacionesService.getAll().subscribe((codes) => {
                this.habitacionesSubject.next(codes);
                this._habitacionesService.writeIndexDB('Habitaciones', codes);
                resolve(codes);
            });
        });
    }

    async loadLogs(refresh: boolean): Promise<ActivityLogs[]> {
        // Always fetch logs from backend as logs tend to be user-specific and dynamic
        return new Promise((resolve) => {
            this._logsService.getLogs(this.currentUser).subscribe((logs) => {
                this.logsSubject.next(logs);
                resolve(logs);
            });
        });
    }

    async loadReservaciones(refresh:boolean=false): Promise<Huesped[]> {
        if (!refresh) {
            const reservacionesIndexDb = await this._reservacionesService.readIndexDB('Reservaciones');
            if (reservacionesIndexDb && !refresh) {
                this.reservacionesSubject.next(reservacionesIndexDb); // Update subject
                return reservacionesIndexDb;
                }
        }
        return new Promise((resolve) => {
            this._reservacionesService.getAll().subscribe(reservas => {
            this.reservacionesSubject.next(reservas); // Update subject
            this._reservacionesService.writeIndexDB('Reservaciones', reservas); // Save to IndexedDB
            resolve(reservas); // Resolve the promise with the fetched data
            });
        });
    }

    async loadAdicionales(refresh:boolean=false): Promise<Adicional[]> {
        if (!refresh) {
            const adicionalesIndexDb = await this._serviciosAdicionalesService.readIndexDB('Adicionales');
            if (adicionalesIndexDb && !refresh) {
                this.adicionalesSubject.next(adicionalesIndexDb); // Update subject
                return adicionalesIndexDb;
            }
        }
        return new Promise((resolve) => {
            this._serviciosAdicionalesService.getAdicionales().subscribe(adicionales => {
            this.adicionalesSubject.next(adicionales); // Update subject
            this._serviciosAdicionalesService.writeIndexDB('Reservaciones', adicionales); // Save to IndexedDB
            resolve(adicionales); // Resolve the promise with the fetched data
            });
        });
    }

    async loadTarifas(refresh: boolean): Promise<Tarifas[]> {
        if (!refresh) {
            const tarifasIndexDb = await this._tarifasService.readIndexDB('Tarifas');
            if (tarifasIndexDb) {
                this.tarifasSubject.next(tarifasIndexDb); // Update subject
                return tarifasIndexDb;
            }
        }  
        return new Promise((resolve) => {
            this._tarifasService.getAll().subscribe(tarifas => {
            this.tarifasSubject.next(tarifas); // Update subject
            this._tarifasService.writeIndexDB('Tarifas', tarifas); // Save to IndexedDB
            resolve(tarifas); // Resolve the promise with the fetched data
            });
        });
    }

    async loadCodes(refresh:boolean): Promise<Codigos[]> {
        if(refresh){
            const codesIndexDb = await this._codesService.readIndexDB('Codes');
            if (codesIndexDb) {
                this.codigosSubject.next(codesIndexDb); // Update subject
                return codesIndexDb;
            } 
        }
        return new Promise((resolve) => {
            this._codesService.getAll().subscribe(codes => {
            this.codigosSubject.next(codes); // Update subject
            this._codesService.writeIndexDB('Codes', codes); // Save to IndexedDB
            resolve(codes); // Resolve the promise with the fetched data
            });
        });
    }

    async loadFoliador(refresh:boolean): Promise<Foliador[]> {
        if(refresh){
            const foliosIndexDb = await this._foliosService.readIndexDB('Folios');
            if (foliosIndexDb) {
                this.foliosSubject.next(foliosIndexDb); // Update subject
                return foliosIndexDb;
            }
        }
        return new Promise((resolve) => {
            this._foliosService.getAll().subscribe(folios => {
            this.foliosSubject.next(folios); // Update subject
            this._foliosService.writeIndexDB('Folios', folios); // Save to IndexedDB
            resolve(folios); // Resolve the promise with the fetched data
            });
        });
    }


    // GETTERS

    getHouseKeepingCodes(): HouseKeeping[] {
        return this.houseKeepingCodesSubject.getValue();
    }

    getRoomCodes(): Habitacion[] {
        return this.habitacionesSubject.getValue();
    }

    getCodigosCodes(): Codigos[] {
        return this.codigosSubject.getValue();
    }

    getEstatusCodes(): Estatus[] {
        return this.estatusSubject.getValue();
    }

    getTarifasCodes(): Tarifas[] {
        return this.tarifasSubject.getValue();
    }

    getParametrosModel(): Parametros {
        return this.parametrosSubject.getValue();
    }

    getReservaciones(): Huesped[] {
        return this.reservacionesSubject.getValue();
    }

    getHabitaciones(): Habitacion[] {
        return this.habitacionesSubject.getValue();
    }

}