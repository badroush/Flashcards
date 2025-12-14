import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flashcard, FlashcardResponse } from '../models/flashcard.model';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFlashcards(): Observable<FlashcardResponse> {
    return this.http.get<FlashcardResponse>(`${this.apiUrl}/card/get`);
  }

  createFlashcard(data: Partial<Flashcard>): Observable<Flashcard> {
    return this.http.post<Flashcard>(`${this.apiUrl}/card`, data);
  }

  updateFlashcard(id: string, data: Partial<Flashcard>): Observable<Flashcard> {
    return this.http.patch<Flashcard>(`${this.apiUrl}/card/update/${id}`, data);
  }

  deleteFlashcard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/card/delete/${id}`);
  }

}

