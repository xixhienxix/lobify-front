import { AuthModel } from './auth.model';

export class UserModel extends AuthModel {
  _id: number;
  username: string;
  password: string;
  nombre: string;
  email: string;
  pic?: string;
  roles?: number[] = [];
  occupation?: string;
  companyName?: string;
  phone?: string;
  // personal information
  firstname?: string;
  lastname?: string;
  // account information
  language?: string;
  timeZone?: string;
  communication?: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  terminos:string;
  accessToken:string;
  hotel:string;
  rol:number;
  

  setUser(_user: unknown) {
    const user = _user as UserModel;
    this._id = user._id;
    this.username = user.username || '';
    this.password = user.password || '';
    this.nombre = user.nombre || '';
    this.email = user.email || '';
    this.pic = user.pic || './assets/media/avatars/blank.png';
    this.roles = user.roles || [];
    this.occupation = user.occupation || '';
    this.companyName = user.companyName || '';
    this.phone = user.phone || '';
  }
}
