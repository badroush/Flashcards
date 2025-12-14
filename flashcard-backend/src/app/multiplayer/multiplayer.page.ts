// src/app/multiplayer/multiplayer.page.ts
import { Component } from '@angular/core';
import { FlashcardService } from '../services/flashcard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.page.html',
  styleUrls: ['./multiplayer.page.scss'],
  standalone:false,
})
export class MultiplayerPage {
  // Données du jeu
  flashcards: any[] = [];
  currentIndex = 0;
  selectedOptionIndex: number | null = null;
  feedback: 'correct' | 'incorrect' | null = null;
  gameQuestions: any[] = [];
  // Joueurs
  player1Name = '';
  player2Name = '';
  currentPlayer: 'player1' | 'player2' = 'player1';
  phase: 'setup' | 'playing' | 'finished' = 'setup';

  // Scores
  score1 = 0;
  score2 = 0;
  private audioCorrect: HTMLAudioElement | null = null;
  private audioIncorrect: HTMLAudioElement | null = null;

  constructor(private flashcardService: FlashcardService,private router: Router) {}

  ngOnInit() {
    this.loadFlashcards();
  this.audioCorrect = new Audio('assets/sounds/success.mp3');
  this.audioIncorrect = new Audio('assets/sounds/wrong.mp3');
  }

  loadFlashcards() {
    this.flashcardService.getFlashcards().subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.flashcards = response.data.map((card: any) => {
            if (!card.options) {
              return {
                question: card.question,
                options: [
                  { text: card.answer, isCorrect: true },
                  { text: 'Autre réponse', isCorrect: false }
                ]
              };
            }
            return {
              question: card.question,
              options: card.options.map((opt: any) =>
                typeof opt === 'string'
                  ? { text: opt, isCorrect: false }
                  : { text: opt.text || opt, isCorrect: !!opt.isCorrect }
              )
            };
          });
        }
      },
      error: (error) => console.error('Erreur:', error),
    });
  }

  startGame() {
  if (!this.player1Name.trim() || !this.player2Name.trim()) {
    alert('Veuillez entrer les noms des deux joueurs.');
    return;
  }

  // ✅ Sélectionner 10 questions aléatoires (ou toutes si < 10)
  const totalQuestions = 10;
  const shuffled = this.shuffleArray(this.flashcards);
  this.gameQuestions = shuffled.slice(0, totalQuestions);

  this.phase = 'playing';
  this.currentPlayer = 'player1';
  this.currentIndex = 0;
  this.score1 = 0;
  this.score2 = 0;
}

// Méthode de sélection (modifiée)
selectOption(index: number) {
  // Ne rien faire si une réponse est déjà en cours
  if (this.feedback !== null) return;

  const option = this.gameQuestions[this.currentIndex].options[index];
  this.selectedOptionIndex = index;

  if (option.isCorrect) {
    this.feedback = 'correct';
    // 🔊 Son de succès
    this.audioCorrect?.play().catch(e => console.warn('Audio play failed:', e));

    // 👍 Score
    if (this.currentPlayer === 'player1') this.score1 += 10;
    else this.score2 += 10;

    setTimeout(() => {
      if (this.currentIndex < this.gameQuestions.length - 1) {
        this.currentIndex++;
        this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
        this.resetState();
      } else {
        this.phase = 'finished';
      }
    }, 800); // ✅ Délai avant changement de question
  } else {
    this.feedback = 'incorrect';
    // 🔊 Son d'erreur
    this.audioIncorrect?.play().catch(e => console.warn('Audio play failed:', e));

    // 👎 Pénalité
    if (this.currentPlayer === 'player1') this.score1 = Math.max(0, this.score1 - 1);
    else this.score2 = Math.max(0, this.score2 - 1);

    // ✅ Réinitialiser après un court délai pour permettre de continuer
    setTimeout(() => {
      this.resetState();
    }, 1000); // ⏱️ Attendre 1 seconde avant de réinitialiser
  }
}
  resetState() {
  this.selectedOptionIndex = null;
  this.feedback = null;
}

  restartGame() {
    this.phase = 'setup';
    this.player1Name = '';
    this.player2Name = '';
  }

  // Méthodes utilitaires
  getLetter(index: number): string {
    return ['A', 'B', 'C', 'D', 'E'][index] || '?';
  }

  // Mélange un tableau (algorithme de Fisher-Yates)
shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
  }

  goToHome() {
  this.router.navigate(['/home']);
  }

  ngOnDestroy() {
  this.audioCorrect?.pause();
  this.audioIncorrect?.pause();
}
}
