import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Room } from './interface/room';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // auth api collection
  login(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'auth/login', data);
  }

  signup(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'auth/signup', data);
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'auth/verify-otp', data);
  }

  resendOtp(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'auth/resend-otp', data);
  }

  requestPasswordReset(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'auth/request-password-reset', data);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'auth/reset-password', data);
  }

  getUser(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'auth/me');
  }

  // mess collection
  getMessWithCode(messCode: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'mess/search/' + messCode);
  }

  joinMess(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess/join', data);
  }

  checkRequestStatus(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'mess/check-request-status');
  }

  cancelRequest(): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess/cancel-request', {});
  }

  createMess(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess', data);
  }

  validateEmail(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess/validate-email', data);
  }

  leaveMess(): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess/leave', {});
  }

  acceptMember(userId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess/accept-member/' + userId, {});
  }

  rejectMember(userId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'mess/reject-member/' + userId, {});
  }

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
    return this.http.get<any>(this.apiUrl + 'summary?month=' + month);
  }
  
}
