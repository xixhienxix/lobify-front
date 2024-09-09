export interface Parametros {
    _id?:string,
    iva:number,
    ish:number,
    divisa:string,
    zona:string,
    noShow:string,
    checkOut:string,
    checkIn:string,
    codigoZona:string,
    id?:string,
    hotel?:string;
    tarifasCancelacion?:string;
    autoCheckOut?:boolean;
    noShowAutoUpdated?:boolean;
}
export const PARAMETROS_DEFAULT_VALUES:Parametros = {
    iva:16,
    ish:3,
    divisa:'Peso',
    zona:'America/Mexico_City',
    noShow:'11:00',
    checkOut:'12:00',
    checkIn:'01:00',
    codigoZona:'-05:00',
}

