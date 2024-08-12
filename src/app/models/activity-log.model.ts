export interface ActivityLogs{
    folio:string;
    timestamp: string; 
    message: string; 
    username:string;
    hotel?:string
}
export const DEFAULT_LOG = {
    folio: '',
    timestamp: '', 
    message: '', 
    username: '',
}
