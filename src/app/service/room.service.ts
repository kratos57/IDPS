import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient) { }
  createRoom(creator: string): Observable<{ roomCode: string }> {
    return this.http.post<{ roomCode: string }>('/api/room', { creator });
  }

  // Invite a friend by email
  inviteFriend(email: string, roomCode: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/room/invite', { email, roomCode });
  }

  // Validate the room code
  validateRoomCode(roomCode: string): Observable<any> {
    return this.http.post('/api/room/validateRoom', { roomCode });
  }
  joinRoom(roomCode: string): Observable<{ message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<{ message: string }>('/api/room/joinRoom', { roomCode }, { headers });
  }



  // Get users in a room (only for the creator)
  getUsersInRoom(roomCode: string, userId: string): Observable<{ users: string[] }> {
    return this.http.get<{ users: string[] }>(`/api/room/${roomCode}/users`, { params: { userId } });
  }

}
