export interface edoCuenta {
    _id?:string,
    id?:string,
    Folio:string,
    Referencia?:string,
    Forma_de_Pago:string,
    Fecha:Date,
    Fecha_Cancelado?:string,
    Descripcion:string,
    Cantidad:number,
    Cargo?:number,
    Abono?:number,
    Total?:number,
    Estatus:string,
    Autorizo?:string,
    hotel?:string;

}
