export interface VisibilityRates {
    name:string,
    value:boolean,
    subTask?:VisibilityRates[]
}

export const DEFAULT_VISIBILITY_RATES: VisibilityRates = {
    name:'',
    value:true,
}