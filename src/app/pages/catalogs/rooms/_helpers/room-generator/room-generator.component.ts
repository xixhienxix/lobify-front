import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { duplicateValuesValidator } from "../duplicateValuesValidator";

@Component({
    selector:'app-room-generator',
    styleUrls:['./room-generator.component.scss'],
    templateUrl:'./room-generator.component.html',
})
export class RoomGeneratorComponent implements OnInit{

    quantityInv:number=1;
    roomForm:FormGroup;
    nombreHabs:string[]=[]
    nombresIguales:boolean=false


    constructor ( public fb : FormBuilder,
    ){
        this.roomForm = this.fb.group({
            habs: this.fb.array([], duplicateValuesValidator()),
            inventario: [1, Validators.required],
          });   
    }
    
    get numeroHabs(): FormArray {
        return this.roomForm.get('habs') as FormArray; // Cast to FormArray
    }

    ngOnInit(): void {
        this.numeroHabs.push(new FormControl('', Validators.required)); // Add the first input
        // Listen for changes to the form array and update nombreHabs
        this.numeroHabs.valueChanges.subscribe((values: string[]) => {
            this.nombreHabs = values.filter((val) => val.trim() !== ''); // Exclude empty strings
        });
    }


    clearHabsNumber(checked:boolean){
        if(!checked){
          this.numeroHabs.patchValue(this.numeroHabs.controls.map(() => ''));
        }else{
          this.nombreHabs = []
          return
        }
      }

        // Method to decrease  and update inputs
  removeInput() {
    if (this.quantityInv > 1) {
        this.quantityInv--; // Decrease the 
        this.numeroHabs.removeAt(this.numeroHabs.length - 1); // Remove the last input
    }
}

  // Method to increase  and update inputs
  addInput() {
      const name = new FormControl('', Validators.required);

      this.quantityInv++; // Increase the 
      this.numeroHabs.push(name); // Add a new input
  }

//   for(let y=0; y<this.numeroHabs.value.length;y++){
//     if(this.numeroHabs.value[y] === ''){
//       this.nombreHabs.push(this.formGroup.value.nombre.toString()+((y+1).toString()))
//     }
//   }
}