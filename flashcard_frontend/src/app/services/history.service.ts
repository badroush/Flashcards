// src/app/services/history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryEntry } from '../models/history.model';
import { environment } from 'src/environments/environment';

export interface HistoryResponse {
  status: string;
  data: HistoryEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  constructor(private http: HttpClient) {}

  getUserHistory(userId: string): Observable<HistoryResponse> {
    console.log('📡 [SERVICE] Demande des stats pour userId:', userId);
    return this.http.get<HistoryResponse>(`${this.apiUrl}/stats/${userId}`);
  }

  addHistory(entry: Omit<HistoryEntry, '_id'>): Observable<HistoryEntry> {
    return this.http.post<HistoryEntry>(this.apiUrl, entry);
  }

  // src/app/services/history.service.ts

// Ajoute cette méthode
getUserStats(userId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/stats/${userId}`);
}
}
