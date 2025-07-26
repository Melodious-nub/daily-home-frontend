import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Room } from './interface/room';

@Injectable({
  providedIn: 'root'
})
export class Api {
  apiUrl: string = 'https://daily-home-backend.onrender.com/api/';

  constructor(private http: HttpClient) {}

  // rooms api collection
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl + 'rooms');
  }

  addRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl + 'rooms', room);
  }

  deleteRoom(roomId: string): Observable<any> {
    return this.http.delete(this.apiUrl + 'rooms/' + roomId);
  }

  // members api collection
  getMembers(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'members');
  }

  addMember(data: any): Observable<any> {
    return this.http.post<Room>(this.apiUrl + 'members', data);
  }

  deleteMember(id: string): Observable<any> {
    return this.http.delete(this.apiUrl + 'members/' + id);
  }  

  // bazar collection
  getBazar(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'bazars');
  }

  addBazar(data: any): Observable<any> {
    return this.http.post<Room>(this.apiUrl + 'bazars', data);
  }

  deleteBazar(id: string): Observable<any> {
    return this.http.delete(this.apiUrl + 'bazars/' + id);
  }

  // wallet collection
  getWallet(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'wallets');
  }

  addWallet(data: any): Observable<any> {
    return this.http.post<Room>(this.apiUrl + 'wallets', data);
  }

  deleteWallet(id: string): Observable<any> {
    return this.http.delete(this.apiUrl + 'wallets/' + id);
  }

  // Meals collection
  getMeals(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'meals');
  }

  addMeals(data: any): Observable<any> {
    return this.http.post<Room>(this.apiUrl + 'meals', data);
  }

  deleteMeal(id: string): Observable<any> {
    return this.http.delete(this.apiUrl + 'meals/' + id);
  }

  // summaryDetails
  getSummary(month: any) {
    return this.http.get<any>(this.apiUrl + 'summary?month' + month);
  }
  
}
