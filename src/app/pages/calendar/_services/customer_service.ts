import { Injectable } from '@angular/core';
import { Huesped } from '../_models/huesped.model';

export const EMPTY_CUSTOMER: Huesped = {
    _id:undefined,
    folio:undefined,
    adultos:1,
    ninos:1,
    nombre: '',
    estatus:'',
    // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
    // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
    llegada:'',
    salida:'',
    noches: 1,
    tarifa:'Tarifa Rack',
    porPagar: 500,
    pendiente:500,
    origen: 'Online',
    habitacion: "",
    telefono:"",
    email:"",
    motivo:"",
    //OTROS DATOs
    fechaNacimiento:'',
    trabajaEn:'',
    tipoDeID:'',
    numeroDeID:'',
    direccion:'',
    pais:'',
    ciudad:'',
    codigoPostal:'',
    lenguaje:'Español',
    numeroCuarto:'0',
    creada: new Date().toString(),
    tipoHuesped:"Regular",
    notas:'',
    vip:'',
    ID_Socio:0
  };

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    constructor() { 
    }
}