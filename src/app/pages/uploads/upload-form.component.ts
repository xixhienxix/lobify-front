import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUpload } from 'src/app/models/file.upload.model';
import { FileUploadService } from 'src/app/services/file.upload.service';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadFormComponent implements OnInit, OnChanges {
  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;
  myRenamedFile:File
  @Input() fileName:string=''
  @Input() triggerUpload = false;
  @Output() imageSelected = new EventEmitter<boolean>();
  message:string=''
  imgURL: any;
  public imagePath:any;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any) {
      if(typeof changes?.triggerUpload !== 'undefined' ){
        if(changes.triggerUpload.currentValue===true){
          this.upload()
        }
      }      
  }

  selectFile(event:any): void {
    this.selectedFiles = event.target.files;

    const file:any = this.selectedFiles.item(0);
    const typeName = file.type.split("/")[1]
    this.myRenamedFile = new File([file], this.fileName+'.'+typeName);

    var mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    var reader = new FileReader();
    this.imagePath = file;
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }

    this.imageSelected.emit(true)
  }

  upload(): void {

    // this.selectedFiles = new FileList;

    this.currentFileUpload = new FileUpload(this.myRenamedFile);
    this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(
      (percentage:any) => {
        this.percentage = Math.round(percentage);
      }
    );
  }
}
