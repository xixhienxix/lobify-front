
export interface Bloqueo
{
  _id:string;
  Habitacion:Array<string>;
  Cuarto:Array<number>;
  Desde:string;
  Hasta:string;
  sinLlegadas:boolean;
  sinSalidas:boolean;
  fueraDeServicio:boolean;
  Comentarios:string;
  hotel?:string;

}
