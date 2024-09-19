import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../service/file-upload.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  fileToUpload: File | null = null;
  uploadedFileUrl: string | null = null;
  uploadedFileCategory: string | null = null;
  files: any[] = [];
  filterDate: string = '';
  filterCategory: string = '';
  filterFileType: string = '';
  sortBy: string = '';
  versions: any[] = [];
  selectedFile: string | null = null;
  roomCode: string = '';
  userId: string = '';
  constructor(private fileUploadService: FileUploadService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.roomCode = params['roomCode'] || '';
    });
    this.fetchFiles();
  }
  onFileChange(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  onUpload() {
    if (this.fileToUpload && this.roomCode) {
      this.fileUploadService.uploadFile(this.fileToUpload, this.roomCode).subscribe({
        next: (response: any) => {
          this.uploadedFileUrl = response.fileUrl;
          this.uploadedFileCategory = response.category;
          this.fetchFiles();
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        }
      });
    } else {
      console.error('File or room code is missing.');
    }
  }

  fetchFiles() {
    this.fileUploadService.getFiles(this.filterDate, this.filterCategory, this.filterFileType, this.sortBy, this.roomCode).subscribe({
      next: (files: any[]) => {
        this.files = files;
      },
      error: (error) => {
        console.error('Error fetching files:', error);
      }
    });
  }

  viewVersions(filename: string) {
    this.selectedFile = filename;
    console.log('Selected file:', this.selectedFile);  // Check if this is undefined
    if (this.selectedFile) {
      this.fileUploadService.getFileVersions(this.selectedFile).subscribe({
        next: (response: any) => {
          this.versions = response.versions;
        },
        error: (error) => {
          console.error('Error fetching file versions:', error);
        }
      });
    } else {
      console.error('No file selected.');
    }
  }

  onUpdateVersion() {
    if (this.selectedFile && this.fileToUpload) {
      this.fileUploadService.updateFileVersion(this.selectedFile, this.fileToUpload).subscribe({
        next: (response: any) => {
          this.uploadedFileUrl = response.fileUrl;
          this.fetchFiles();
        },
        error: (error) => {
          console.error('Error updating file version:', error);
        }
      });
    }
  }

  revertVersion(filename: string, versionNumber: number) {
    this.fileUploadService.revertFileVersion(filename, versionNumber).subscribe({
      next: () => {
        this.fetchFiles(); // Refresh the list of files
        alert(`Reverted to version ${versionNumber}`);
      },
      error: (error) => {
        console.error('Error reverting file version:', error);
      }
    });
  }
  lockFile(filename: string) {
    this.fileUploadService.lockFile(filename, this.userId).subscribe({
      next: () => {
        this.fetchFiles(); // Refresh the list of files to show updated lock status
        alert('File locked successfully');
      },
      error: (error) => {
        console.error('Error locking file:', error);
      }
    });
  }

  unlockFile(filename: string) {
    this.fileUploadService.unlockFile(filename, this.userId).subscribe({
      next: () => {
        this.fetchFiles(); // Refresh the list of files to show updated lock status
        alert('File unlocked successfully');
      },
      error: (error) => {
        console.error('Error unlocking file:', error);
      }
    });
  }
  deleteFile(filename: string) {
    if (confirm('Are you sure you want to delete this file?')) {
      this.fileUploadService.deleteFile(filename).subscribe({
        next: () => {
          console.log('File deleted successfully');
          this.fetchFiles();  // Refresh the file list after deletion
        },
        error: (error) => {
          console.error('Error deleting file:', error);
        }
      });
    }
  }

}
