import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../models/file.upload.model';
import { HabitacionesService } from './habitaciones.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
private basePath = '/uploads';

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage, private _habitacionService:HabitacionesService) { }

  pushFileToStorage(fileUpload: FileUpload) {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(async(downloadURL:any) => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
          const urlReponse = await this._habitacionService.saveUrlToMongo(downloadURL,fileUpload.file.name)
          console.log(urlReponse)

          return urlReponse
        });
      })
    ).subscribe();

    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.db.list(this.basePath).push(fileUpload);
  }

  getFiles(numberItems:any): AngularFireList<FileUpload> {
    return this.db.list(this.basePath, (ref:any) =>
      ref.limitToLast(numberItems));
  }

  getAllFiles(): AngularFireList<FileUpload>{
    return this.db.list(this.basePath);
  }

  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.basePath);
    storageRef.child(name).delete();
  }


}
