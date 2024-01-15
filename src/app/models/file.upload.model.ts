export class FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;
  hotel?:string;


  constructor(file: File) {
    this.file = file;
  }
}
