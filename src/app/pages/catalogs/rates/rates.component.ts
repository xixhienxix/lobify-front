import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, firstValueFrom, takeUntil } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Tarifas } from 'src/app/models/tarifas';
import { TarifasService } from 'src/app/services/tarifas.service';
import { EditExpressRateComponent } from './express-rates/edit-express-rate/edit-express-rate.component';
import { ExpressRatesComponent } from './express-rates/express.rates.component';
import { SpecialRatesComponent } from './special-rates/special-rates.component';
import { EditSpecialRateComponent } from './special-rates/edit-special-rate/edit-standard-rate.component';
import { HabitacionesService } from 'src/app/services/habitaciones.service';


@Component({
  selector: 'app-special-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.scss']
})
export class RatesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //DOM
  isLoading: boolean;

  //Table
  displayedColumns: string[] = ['Tarifa', 'Habitacion', 'Plan', 'Politicas','Estancia','Estado','Acciones'];
  dataSource = new MatTableDataSource<any>();
  displayedColumnsEspecial: string[] = ['Tarifa', 'Habitacion', 'Plan', 'Politicas','Estancia','Estado','Acciones'];
  dataSourceEspecial = new MatTableDataSource<any>();

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  /**Flags */
  reloading:boolean=false;

  /**Models */
  options = [
    {name:'Lun', value:'0', checked:false},
    {name:'Mar', value:'1', checked:false},
    {name:'Mie', value:'2', checked:false},
    {name:'Jue', value:'3', checked:false},
    {name:'Vie', value:'4', checked:false},
    {name:'Sab', value:'5', checked:false},
    {name:'Dom', value:'6', checked:false}
  ]
  tarifaRackArr:any[]=[]
  tarifaRackCompleto:Tarifas[]=[]
  tarifaEspecialArray:Tarifas[]=[]

  // ratesArray:Tarifas[]=[];
  // ratesArrayComplete:Tarifas[]=[];
  
  /**Variables */
  closeResult:string
  
  private ngUnsubscribe = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    public fb : FormBuilder,
    public _tarifasService:TarifasService,
    public modalService:NgbModal,
    public _habitacionService:HabitacionesService
  ) { 
    const sb =this._tarifasService.getNotification().subscribe(data=>{
      if(data)
      {
        // this.dataSourceEspecial.data=[]
        // this.dataSource.data=[]
        this.getTarifas(false);
      }
    });
    this.subscriptions.push(sb)
  }

  ngOnInit(): void {
    this.getTarifas(false);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async getTarifas(refreshTable:boolean){
    let dataSourceBS

    if(refreshTable){
      this._tarifasService.getAll()
      .pipe(
        takeUntil(this.ngUnsubscribe)).subscribe({
          next: (val:Tarifas[])=>{
            dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
            this.tarifaRackCompleto=dataSourceBS
            this.buildDataSource(dataSourceBS);
            this.reloading=false;
        },
        error: (err)=>{
          console.log(err);
          this.promptMessage('Error','No se pudieron cargar las tarifas intente de nuevo mas tarde')
        },
        complete:()=>{
        }
        })
    }

    const ratesIndexDB:Tarifas[] = await this._habitacionService.readIndexDB("Rates");
    
    if(ratesIndexDB){
      if(ratesIndexDB.length !== 0){
        this._tarifasService.setCurrentTarifasValue = ratesIndexDB
        dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
        this.tarifaRackCompleto = ratesIndexDB
        this.buildDataSource(dataSourceBS);
  
        this.isLoading = false
        this.reloading = false
      }else{
        this._tarifasService.getAll()
        .pipe(
          takeUntil(this.ngUnsubscribe)).subscribe({
            next: (val:Tarifas[])=>{
              dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
              this.tarifaRackCompleto=dataSourceBS
              this.buildDataSource(dataSourceBS);
  
          },
          error: (err)=>{
            console.log(err);
            this.promptMessage('Error','No se pudieron cargar las tarifas intente de nuevo mas tarde')
          },
          complete:()=>{
          }
          })
      }
    } else 
    {
      const sb  =  this._tarifasService.getAll()
      .pipe(
        takeUntil(this.ngUnsubscribe)).subscribe({
          next: (val:Tarifas[])=>{
            dataSourceBS = this._tarifasService.getCurrentTarifasValue.getValue()
            this.tarifaRackCompleto=dataSourceBS
            this.buildDataSource(dataSourceBS);
            this.isLoading = false
            this.reloading = false
        },
        error: (err)=>{
          console.log(err);
          this.promptMessage('Error','No se pudieron cargar las tarifas intente de nuevo mas tarde')
        },
        complete:()=>{
        }
        })
      }
  }

  buildDataSource(data:Tarifas[]){
    this.dataSourceEspecial.data=[]
    this.dataSource.data=[]
    this.tarifaEspecialArray=[]
    this.tarifaRackArr=[]
    this.isLoading=true

    this.tarifaRackCompleto = data

    this.tarifaEspecialArray = this.tarifaRackCompleto.filter((val)=> val.Tarifa !== 'Tarifa Estandar' )
    this.tarifaRackArr = this.tarifaRackCompleto.filter((val)=> val.Tarifa === 'Tarifa Estandar' )

            /*Borra Duplicados*/
    var borraDuplicados = this.tarifaEspecialArray.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.Tarifa === value.Tarifa
          )));
      

    this.dataSource.data=this.tarifaRackArr     
    this.dataSourceEspecial.data=borraDuplicados   
    this.isLoading = false
    this.reloading = false

  }

  promtDelete(tarifa:Tarifas){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Advertencia'
        modalRef.componentInstance.mensaje='Estas seguro que deseas eliminar la tarifa para la habitación '+tarifa.Tarifa+''          
        modalRef.result.then((result) => {
          if(result=='Aceptar')        
          {
            this.deleteTarifaRackEspecial(tarifa.Tarifa)
            this.tarifaEspecialArray=[]
          } 
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
  }

  promptMessage(header:string,message:string, obj?:any){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje= message    
    modalRef.result.then((result) => {
      if(result=='Aceptar')        
      {
        // this.deleteTarifaRackEspecial(element)
        // this.tarifaEspecialArray=[]
      } 
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      setTimeout(() => {
        modalRef.close('Close click');
      },4000)
      return
  }


  deleteTarifaRackEspecial(element:string){

      this._tarifasService.deleteTarifaEspecial(element).subscribe({
        next:(value)=>{
          this.promptMessage('Exito','Tarifa Eliminada con éxito' )
          // this._tarifasService.sendNotification(true);
          this.getTarifas(false);
        },
        error: (error)=>{
          this.promptMessage('Error','No se pudo eliminar la tarifa intente de nuevo mas tarde')
          console.log(error)
        }
      })
      
  }

  editTarifaEspecial(row:any){
    const modalref = this.modalService.open(EditSpecialRateComponent,{size:'lg',backdrop:'static'})
    modalref.componentInstance.tarifa=row
  }

  nuevaTarifaEspecial(){
    const modalRef = this.modalService.open(SpecialRatesComponent, { size: 'md',backdrop: 'static' });

      modalRef.result.then( () =>
      () => { }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
  }

}
