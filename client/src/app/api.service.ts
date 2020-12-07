import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Guest } from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    constructor (private http:HttpClient) {}

    async getData():Promise<Guest[]> {
        return await this.http.get<Guest[]>('http://localhost:3000/api/rsvp').toPromise()
    }
}
