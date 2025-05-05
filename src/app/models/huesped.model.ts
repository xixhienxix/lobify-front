import { Tarifas } from "./tarifas";

export interface Huesped {

    _id?: string;
    folio:string
    adultos:number;
    ninos:number;
    nombre: string;
    // apellido: string;
    estatus: string; // Huesped en Casa = 1 | Reserva Sin Pago = 2 | Reserva Confirmada = 3 | Hizo Checkout = 4 | Uso Interno = 5 | Bloqueo = 6 | Reserva Temporal = 7
    llegada: string;
    salida: string;
    noches: number;
    tarifa:Tarifas;
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
    desgloseEdoCuenta:{ fecha: string; tarifaTotal: number }[] | number | any[]

  }

  // export const DEFAULT_HUESPED:Huesped = {

  //   _id : '',
  //   folio:'',
  //   adultos:1,
  //   ninos:0,
  //   nombre: '',
  //   // apellido: string;
  //   estatus: '', // Huesped en Casa = 1 | Reserva Sin Pagar = 2 | Reserva Confirmada = 3 | Hizo Checkout = 4 | Uso Interno = 5 | Bloqueo = 6 | Reserva Temporal = 7
  //   llegada: '',
  //   salida: new Date().toISOString(),
  //   noches: 1,
  //   tarifa:undefined,
  //   porPagar: 0,
  //   pendiente: 0,
  //   origen: 'Reserva',
  //   habitacion: '',
  //   telefono:'',
  //   email:'',
  //   motivo:'',
  //   //Otros Detalles
  //   fechaNacimiento:'',
  //   trabajaEn:'',
  //   tipoDeID:'',
  //   numeroDeID:'',
  //   direccion:'',
  //   pais:'',
  //   ciudad:'',
  //   codigoPostal:'',
  //   lenguaje:'',
  //   numeroCuarto:'',
  //   creada:'',
  //   tipoHuesped:'',
  //   notas:'',
  //   vip:'',
  //   ID_Socio:0,
  //   estatus_Ama_De_Llaves:'',
  //   hotel:'',
  
  // }
  
  export const reservationStatusMap: { [key: number]: string[] } = {
    1: [
      'Huesped en Casa',
      'Walk-In',
      'Reserva en Casa'
    ],
    2: [
        'Reserva Sin Pago',
        'Reserva Confirmada',
        'Deposito Realizado',
        'Esperando Deposito',
        'Totalmente Pagada'
    ],
    4: [
      'Check-Out'
    ],
    5: ['Uso Interno'],
    6: ['Bloqueo'],
    7: ['Reserva Temporal'],
    8: [
      'No Show',
      'Reserva Cancelada'
    ]
};
  