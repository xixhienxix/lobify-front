export interface Historico {

    _id?: string;
    folio:string
    adultos:number;
    ninos:number;
    nombre: string;
    // apellido: string;
    estatus: string; // Huesped en Casa = 1 | Reserva Sin Pagar = 2 | Reserva Confirmada = 3 | Hizo Checkout = 4 | Uso Interno = 5 | Bloqueo = 6 | Reserva Temporal = 7
    llegada: string;
    salida: string;
    noches: number;
    tarifa:string;
    porPagar?: number;
    pendiente?: number;
    origen: string;
    habitacion: string;
    telefono:string;
    email:string;
    motivo:string;
    //Otros Detalles
    fechaNacimiento:string;
    trabajaEn:string;
    tipoDeID:string;
    numeroDeID:string;
    direccion:string;
    pais:string;
    ciudad:string;
    codigoPostal:string;
    lenguaje:string;
    numeroCuarto:string;
    creada:string;
    tipoHuesped:string;
    notas?:string;
    vip?:string;
    ID_Socio?:number;
    estatus_Ama_De_Llaves?:string;
    hotel?:string;
  
  }
  
  