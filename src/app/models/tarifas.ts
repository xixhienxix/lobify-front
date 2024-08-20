import { Politicas } from "./politicas.model";
import { VisibilityRates } from "./visibility.model";
interface TarifasDisponibles {
    Activa:boolean,
        Descripcion:string,
        Tarifa_1:number, // Tarifa para una persona
        Tarifa_2:number,// Tarifa para dos persona
        Tarifa_3:number,// Tarifa para tres persona
        Tarifa_N:number,// Tarifa para mas de tres persona
        Dias:{
            rateIndex:number,
            name: string;
            value: number;
            checked: boolean; // si es true la tarifa es valida para este dia de la semana
        }[],
}

export interface Tarifas {
    _id?:string;
    Tarifa:string;
    Habitacion:string[];
    Llegada:Date;
    Salida:Date;
    Plan:string;
    Politicas?:Politicas[];
    EstanciaMinima:number;
    EstanciaMaxima:number;
    TarifaRack?:number;
    Estado:boolean,
    Adultos:number,
    Ninos:number,
    Dias?:{
        name: string;
        value: number;
        checked: boolean;
    }[],
    TarifasActivas:TarifasDisponibles[]
    Visibilidad:VisibilityRates,
    Cancelacion:Politicas[],
    hotel?:string;
    Descuento?:number
}


export interface TarifasRadioButton {

    Tarifa:string;
    Habitacion:string[];
    Llegada:Date;
    Salida:Date;
    Plan:string;
    Politicas?:Politicas[];
    EstanciaMinima:number;
    EstanciaMaxima:number;
    TarifaRack?:number;
    TarifaXAdulto?:number[]
    TarifaXNino?:number[]
    Estado:boolean,
    Adultos:number,
    Ninos:number,
    Dias?:{
        name: string;
        value: number;
        checked: boolean;
    }[],
    hotel?:string;
    Descuento?:number,
    checked:boolean

}