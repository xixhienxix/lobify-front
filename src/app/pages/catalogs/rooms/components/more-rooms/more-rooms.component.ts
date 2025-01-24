import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { RoomGeneratorComponent } from "../../_helpers/room-generator/room-generator.component";
import { HabitacionesService } from "src/app/services/habitaciones.service";
import { Habitacion } from "src/app/models/habitaciones.model";

@Component({
    selector: 'app-add-room',
    styleUrls: ['./more-rooms-component.scss'],
    templateUrl:'./more-rooms.component.html'
})
export class AddRoomComponent {
    constructor (public modal : NgbActiveModal,
        private roomsService:HabitacionesService
    ){}
    responsemessage:string = ''

    @ViewChild(RoomGeneratorComponent) roomGenerator!: RoomGeneratorComponent;
    @Input() codigoCuarto: string=''
    @Input() cuartosArray: any
    @Output() honAddedRooms: EventEmitter<string> = new EventEmitter();

    onAccept() {
        if (!this.roomGenerator || !this.roomGenerator.nombreHabs) {
            return;
        }

        if(this.roomGenerator.nombreHabs.length === 0){
            for(let y=0; y<this.roomGenerator.numeroHabs.value.length;y++){
                if(this.roomGenerator.numeroHabs.value[y] === ''){
                    this.roomGenerator.nombreHabs.push(this.codigoCuarto.toString()+((y+1).toString()))
                }
              }
        }

        if(this.cuartosArray){
            this.roomGenerator.nombreHabs.forEach((item, index) => {
                // Iterate through each object in this.cuartosArray
                const match = this.cuartosArray.some((cuarto:any) => cuarto.Numero === item);
                
                // If a match is found, update the value at the corresponding index
                if (match) {
                  this.roomGenerator.nombreHabs[index] = `${item}(1)`;
                }
              });
        }
        
        const nombreHabs = this.roomGenerator.nombreHabs;

        if (nombreHabs.length === 0) {
            this.responsemessage = 'No se crearon las habitaciones intente nuevamente.';
        }
    
        this.sendRooms(nombreHabs);
        this.modal.close(nombreHabs);
    }

    sendRooms(habitacionesArr:any){
        this.roomsService.addRooms(habitacionesArr,this.codigoCuarto).subscribe({
            next:(val:any)=>{
                this.honAddedRooms.emit(this.responsemessage)
            }
        })
    }
      
}