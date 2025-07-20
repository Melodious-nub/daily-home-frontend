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
  
}
