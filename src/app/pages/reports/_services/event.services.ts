import { Injectable } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom, Subject } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Huesped } from 'src/app/models/huesped.model';
import { AuthService } from 'src/app/modules/auth';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { LogService } from 'src/app/services/activity-logs.service';
import { HouseKeepingService } from 'src/app/services/housekeeping.service';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
    constructor(private modalService: NgbModal,
        private _indexDbService: IndexDBCheckingService,
        private _housekeepingService: HouseKeepingService,
        private _logService: LogService,
        private _authService:AuthService
    ) {
        this.currentUser = this._authService.getUserInfo().username
}
    closeResult:string='';
    currentUser:string='';

  private prospectSubject = new Subject<Huesped>();
  editReservaEvent$ = this.prospectSubject.asObservable();

  emitEvent(data: any) {
    this.prospectSubject.next(data);
  }

  async onChangeEstatus(data: { cuarto: any; estatus: string }) {
    // Extract old status before making the HTTP request
    const oldStatus = this._indexDbService.getRoomCodes().find(item => item.Numero === data.cuarto)?.Estatus;
  
    try {
      // Perform the status update
      await firstValueFrom(this._housekeepingService.updateEstatus(data.cuarto, data.estatus)).then(() => {
        console.log('Log entry successfully posted.');
      })
      .catch((error) => {
        console.error('Error posting log entry:', error);
      });

      // Perform subsequent operations
      this._indexDbService.checkIndexedDB(['habitaciones'],true);
      this._indexDbService.checkIndexedDB(['reservaciones'],true);  

      // Log the status change
      this._logService.logChangeStatus(data.cuarto, data.estatus, oldStatus!, this.currentUser);
    } catch (error) {
      // Handle any errors that occur during the status update
      console.error('Error updating room status:', error);
      // Optionally log the error
    }
  }

  promptMessage(header:string,message:string){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje= message    
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      setTimeout(() => {
        modalRef.close('Close click');
      },4000)
      return
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