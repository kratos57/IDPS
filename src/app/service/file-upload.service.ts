import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private uploadUrl = 'http://localhost:5000/api/upload';
  private filesUrl = 'http://localhost:5000/api/files';

  constructor(private http: HttpClient) { }

  uploadFile(file: File, roomCode: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('roomCode', roomCode); // Add roomCode to the form data
    return this.http.post(this.uploadUrl, formData);
  }

  getFiles(date?: string, category?: string, fileType?: string, sortBy?: string, roomCode?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (category) params = params.set('category', category);
    if (fileType) params = params.set('fileType', fileType);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (roomCode) params = params.set('roomCode', roomCode); // Add roomCode to the parameters

    return this.http.get(this.filesUrl, { params: params });
  }

  getFileVersions(filename: string): Observable<any> {
    return this.http.get(`${this.filesUrl}/${filename}/versions`);
  }

  updateFileVersion(filename: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.filesUrl}/${filename}/version`, formData);
  }

  revertFileVersion(filename: string, versionNumber: number): Observable<any> {
    return this.http.post(`${this.filesUrl}/${filename}/revert`, { versionNumber });
  }
  lockFile(filename: string, userId: string): Observable<any> {
    return this.http.post(`${this.filesUrl}/${filename}/lock`, { userId });
  }

  unlockFile(filename: string, userId: string): Observable<any> {
    return this.http.post(`${this.filesUrl}/${filename}/unlock`, { userId });
  }
  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.filesUrl}/${filename}`);
  }

}
