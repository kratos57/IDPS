import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../service/room.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  roomCode: string | null = null;
  friendEmail: string = '';
  enteredRoomCode: string = '';
  creatorName: string = ''; // The creator's name
  userName: string = '';
  errorMessage: string = '';
  usersInRoom: string[] = [];

  constructor(private roomService: RoomService, private router: Router) {}

  // Function to create a room
  createRoom() {
    if (this.creatorName) {
      this.roomService.createRoom(this.creatorName).subscribe(response => {
        this.roomCode = response.roomCode;
        console.log('Room created with code:', this.roomCode);
      }, error => {
        console.error('Error creating room:', error);
      });
    } else {
      console.error('Creator name is required.');
    }
  }
  // Function to invite a friend
  inviteFriend() {
    if (this.roomCode && this.friendEmail) {
      this.roomService.inviteFriend(this.friendEmail, this.roomCode).subscribe(response => {
        console.log(response.message);
      }, error => {
        console.error('Error sending invite:', error);
      });
    } else {
      console.error('Room code or email is missing.');
    }
  }
  joinRoom() {
    // Retrieve the username from local storage
    const storedUsername = localStorage.getItem('username');

    if (this.enteredRoomCode && storedUsername) {
      // Call the joinRoom method with only the roomCode
      this.roomService.joinRoom(this.enteredRoomCode).subscribe(response => {
        console.log(response.message);
        // Redirect to the upload page after successfully joining the room
        this.router.navigate(['/upload'], { queryParams: { roomCode: this.enteredRoomCode } });
      }, error => {
        console.error('Error joining room:', error);
        this.errorMessage = 'Error joining the room. Please try again.';
      });
    } else {
      console.error('Room code or username is missing.');
    }
  }



  viewUsersInRoom() {
    if (this.roomCode) {
      this.roomService.getUsersInRoom(this.roomCode, this.creatorName).subscribe(response => {
        this.usersInRoom = response.users;
      }, error => {
        console.error('Error fetching users:', error);
      });
    }
  }


  // Function to validate room code and redirect to the upload page
  submitRoomCode() {
    if (this.enteredRoomCode) {
      this.roomService.validateRoomCode(this.enteredRoomCode).subscribe(response => {
        console.log('Room code is valid:', response.message);
        this.router.navigate(['/upload'], { queryParams: { roomCode: this.enteredRoomCode } });
      }, error => {
        console.error('Invalid room code:', error);
        this.errorMessage = 'Room code does not exist. Please try again.';
      });
    } else {
      console.error('Room code is missing.');
    }
  }
}
