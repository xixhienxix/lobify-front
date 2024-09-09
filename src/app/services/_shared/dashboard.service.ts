import { Injectable } from "@angular/core";
import { Huesped, reservationStatusMap } from "src/app/models/huesped.model";

interface Arrivals {
    llegadasDelDia:Huesped[],
    yaLlegaron:Huesped[],
    porLlegar:Huesped[]
}

const today = new Date('2024-09-02');

@Injectable({
    providedIn: 'root',
  })
export class DashboardService {
    constructor(){

    }

    
    filterReservationsByStatus(
        reservations: Huesped[]
      ): { [key: number]: Huesped[] } {
        const filteredReservations: { [key: number]: Huesped[] } = {};
      
        // Initialize the object with empty arrays for each status key
        Object.keys(reservationStatusMap).forEach(statusKey => {
          filteredReservations[parseInt(statusKey)] = [];
        });
      
        reservations.forEach(reservation => {
          // Find the status key for the reservation status
          const statusKey = Object.keys(reservationStatusMap).find(key =>
            reservationStatusMap[parseInt(key)].includes(reservation.estatus)
          );
      
          if (statusKey) {
            // If the status key is found, add the reservation to the corresponding array
            filteredReservations[parseInt(statusKey)].push(reservation);
          }
        });
      
        return filteredReservations;
      }
      
    filterReservationsByArrivalDate(
        reservations: Huesped[],
        today: Date
      ): { [key: number]: Huesped[] } {
        const reservationsByArrivalDate = reservations.filter(reservation => {
          const arrivalDate = new Date(reservation.llegada);
          return (
            arrivalDate.getFullYear() === today.getFullYear() &&
            arrivalDate.getMonth() === today.getMonth() &&
            arrivalDate.getDate() === today.getDate()
          );
        });
        return this.filterReservationsByStatus(reservationsByArrivalDate);
      }
      
    filterReservationsByDepartureDate(
        reservations: Huesped[],
        today: Date
      ): { [key: number]: Huesped[] } {
        const reservationsByDepartureDate = reservations.filter(reservation => {
          const departureDate = new Date(reservation.salida);
          return (
            departureDate.getFullYear() === today.getFullYear() &&
            departureDate.getMonth() === today.getMonth() &&
            departureDate.getDate() === today.getDate()
          );
        });
        return this.filterReservationsByStatus(reservationsByDepartureDate);
      }
  
}
