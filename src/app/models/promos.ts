export interface Promos {
    tipo:number;
    nombre: string;
    codigo: string;
    qtyPrecio: number;
    inventario: number;
    minNoches: number;
    maxNoches: number;
    desc: string;
    anticipatedNights: number;
    anticipatedNightsmax: number;
    payonly: number;
    stay: number;
    selectedDays: string[];
    hotel: string;
    intialDateFCCheckIn: Date, // Add this
    endDateFCCheckIn: Date, // Add this
    intialValidDateFC: Date, 
    endValidDateFC: Date,
}