import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Parametros } from "src/app/pages/parametros/_models/parametros";
import { ParametrosService } from "src/app/pages/parametros/_services/parametros.service";

@Injectable({
    providedIn: 'root'
})
export class IddleManagerService {

    private idleRefreshInterval: number = 5; // Default to 5 minutes 

    private idleTimer: number = 5; // Default to 5 minutes
    private idleTimeout: any; // Store the interval

    // Subject to notify components when timer triggers
    private idleTriggerSubject = new Subject<void>();

    private idleTimeoutReset: any; // Store the reset timeout
    private lastActivityTime: number = Date.now(); // Track the last user activity time
    private userActivityListenersAttached = false;

    // Observable for components to subscribe
    idleTrigger$ = this.idleTriggerSubject.asObservable();
    
    currentParametros:Parametros | null

    constructor(
        private _parametrosService: ParametrosService
    ){
        // Listen for user activity events
        // this.listenForUserActivity();
    }

    private listenForUserActivity() {
        if (this.userActivityListenersAttached) {
            return; // Prevent multiple registrations
        }
    
        const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart'];
    
        activityEvents.forEach(event => {
            document.addEventListener(event, () => this.resetIdleTimer());
        });
    
        this.userActivityListenersAttached = true; // Mark as registered
    }

    private resetIdleTimer() {
        this.stopIdleTimer(); // Clear the existing timer
        this.startIdleTimer(); // Restart the timer
    }

    async checkIndexedDB(storeName: string, key: string): Promise<any> {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('Lobify'); // Replace with your database name
          request.onsuccess = (event: any) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(key);
            getRequest.onsuccess = () => {
              resolve(getRequest.result); // Returns the data if found
            };
            getRequest.onerror = () => {
              reject(getRequest.error); // Handle errors
            };
          };
          request.onerror = () => {
            reject(request.error);
          };
        });
      }

    /**
     * Fetch or Retrieve Parameters
     */
    async fetchOrRetrieveParametros(storeName: string, key: string): Promise<void> {
        try {
            const storedData = await this.checkIndexedDB(storeName, key);

            if (storedData && storedData.iddleTimer) {
                this.setIdleParameters(storedData.iddleTimer, storedData.refreshTimer);
            } else {
                const parametros = await this._parametrosService.getParametros().toPromise();
                this.setIdleParameters(parametros.iddleTimer, parametros.refreshTimer);
            }
        } catch (err) {
            console.error('Error fetching or retrieving parameters:', err);
            this.setIdleParameters(this.idleTimer, this.idleRefreshInterval);

        }
    }


    /**
     * Starts the idle timer and emits events to subscribed components.
     */
    async startIdleTimer() {
        this.stopIdleTimer(); // Clear any existing timer to prevent duplicates
    
        // Fetch or retrieve parameters (ensure idleTimer is in milliseconds)
        try {
            await this.fetchOrRetrieveParametros('Parametros', 'Parametros');
        } catch (error) {
            console.error('Error fetching parameters:', error);
            return; // Exit if parameters could not be fetched
        }
    
        const idleTimeMs = this.idleTimer; // Ensure it's in milliseconds
        console.log('Idle Time:', idleTimeMs);
    
        // Start a new timeout
        this.idleTimeout = setTimeout(() => {
            console.log('Idle timer triggered');
            this.idleTriggerSubject.next(); // Notify subscribers
            this.startIdleTimer(); // Restart after the trigger
        }, idleTimeMs);
    }
    

      /**
     * Sets idle timer parameters.
     * @param idleTime Timer interval in seconds
     */
      setIdleParameters(idleTime: number, refreshTime: number) {
        // Convert the idleTime and refreshTime from minutes to milliseconds
        this.idleTimer = idleTime * 60 * 1000; // Convert minutes to milliseconds
        this.idleRefreshInterval = refreshTime * 60 * 1000; // Convert minutes to milliseconds
    }
    
    
    stopIdleTimer() {
        // if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null; // Reset the timer reference
        //}
    }
}