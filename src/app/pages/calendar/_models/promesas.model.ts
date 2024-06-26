export interface Promesa
{
    _id?:string;
    Folio:number;
    Fecha:Date;
    Cantidad:number;
    Aplicado:boolean;
    Estatus:string;
    hotel?:string;
}