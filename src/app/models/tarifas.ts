import { Politicas } from "./politicas.model";
import { VisibilityRates } from "./visibility.model";
interface TarifasDisponibles {
    Activa:boolean,
        Descripcion:string,
        Tarifa_1:number,
        Tarifa_2:number,
        Tarifa_3:number,
        Tarifa_N:number,
        Dias:{
            rateIndex:number,
            name: string;
            value: number;
            checked: boolean;
        }[],
}

// interface TarifaBase {
//     Activa:boolean,
//     Descripcion:string,
//     Tarifa_1:number,
//     Tarifa_2:number,
//     Tarifa_3:number,
//     Tarifa_N:number
// }
export interface Tarifas {

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
    // Tarifa_Especial_1:TarifaEspecial,
    // Tarifa_Especial_2:TarifaEspecial,
    // Tarifa_Sin_Variantes: TarifaBase,
    // Tarifa_Extra_Sin:TarifaBase,
    // Tarifa_Extra_Con: TarifaBase,
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