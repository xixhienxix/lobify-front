import { Tarifas } from "./tarifas";

export interface ActivityLogs{
    folio?:string;
    timestamp: string; 
    message: string;
    propertiesChanged?:Record<string, any>;  // Updated type to match the provided value
    payment?:Record<string, any>;
    username:string;
    hotel?:string
    oldStatus?:string
    newStatus?:string
    logType?:number
}
export const DEFAULT_LOG = {
    folio: '',
    timestamp: '', 
    message: '', 
    username: '',
}
export interface PropertiesChanged {
    folio:string;
    llegada:string;
    salida:string;
    adultos:number;
    ninos:number;
    tarifa:Tarifas;
    habitacion:string;
    nombre:string;
    email:string;
    telefono:string;
    porPagar:number;
    pendiente:number;
    noches:number;
    numeroCuarto:string;
    desgloseEdoCuenta:{ fecha: string; tarifaTotal: number }[] | number | any[]
}
