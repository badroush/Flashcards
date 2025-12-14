import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FlashcardService } from '../services/flashcard.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Flashcard } from '../models/flashcard.model';
import { HistoryService } from '../services/history.service';


// Minimal User type used by this component; adapt fields to match your backend model
interface User {
  id?: string;
  name?: string;
  email?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  currentGameId: string | null = null;
  isInGame = false;
  player1: User | null = null;
  player2: User | null = null;
  currentPlayer: 'player1' | 'player2' = 'player1';
  gameStarted = false;
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  selectedOptionIndex: number | null = null;
  feedback: 'correct' | 'incorrect' | null = null;
  isDisabled = false; // Empêche de cliquer plusieurs fois
  private authSubscription: Subscription | null = null;
  isModalOpen = false;
  newQuestion = '';
  onlineUsers: { userId: string; name: string }[] = [];
  newOptions: { text: string; isCorrect: boolean }[] = [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false }
  ];
  private audioCorrect: HTMLAudioElement | null = null;
  private audioIncorrect: HTMLAudioElement | null = null;
  currentUserId: string | null = null;
  constructor(
    private flashcardService: FlashcardService,
    public authService: AuthService,
    private router: Router,
     private historyService: HistoryService
  ) {
  }

ngOnInit() {
  this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.currentUserId = user?.id ?? null; // 🔥 Sauvegarde l'ID
    });
  this.loadBestScore();
  this.loadFlashcards();
  this.audioCorrect = new Audio('assets/sounds/success.mp3');
  this.audioIncorrect = new Audio('assets/sounds/wrong.mp3');
}

private socketListenersSetup = false;
loadBestScore() {
  const saved = localStorage.getItem('bestScore');
  this.bestScore = saved ? parseInt(saved, 10) : 0;
}
loadFlashcards() {
  this.flashcardService.getFlashcards().subscribe({
    next: (response) => {
      if (response.data && Array.isArray(response.data)) {
        // 🔥 Mélanger les questions
        const shuffled = [...response.data].sort(() => 0.5 - Math.random());
        // 🔥 Prendre les 20 premières
        const selected = shuffled.slice(0, 20);

        console.log('📊 [FRONTEND] Questions sélectionnées (20):', selected.length);

        this.flashcards = selected.map((card: any) => {
          if (!card.options) {
            // Conversion ancien format
            return {
              _id: card._id,
              question: card.question,
              options: [
                { text: card.answer, isCorrect: true },
                { text: 'Autre réponse', isCorrect: false }
              ],
              createdAt: card.createdAt,
              updatedAt: card.updatedAt
            };
          }
          // Format normal
          return {
            _id: card._id,
            question: card.question,
            options: card.options.map((opt: any) =>
              typeof opt === 'string'
                ? { text: opt, isCorrect: false }
                : { text: opt.text ?? String(opt), isCorrect: !!opt.isCorrect }
            ),
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
          };
        }) as Flashcard[];
      }
    },
    error: (error) => console.error('Erreur:', error),
  });
}
ngOnDestroy() {
  if (this.authSubscription) {
    this.authSubscription.unsubscribe();
  }
  this.audioCorrect?.pause();
  this.audioIncorrect?.pause();
}
  selectOption(index: number) {
  if (this.feedback === 'correct') return;
  this.selectedOptionIndex = index;
  const option = this.flashcards[this.currentIndex].options[index];
  if (option.isCorrect) {
    this.score += 10;
    this.audioCorrect?.play().catch(e => console.warn('Audio play failed:', e));
    this.feedback = 'correct';
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore.toString());
    }
    setTimeout(() => {
      if (this.currentIndex < this.flashcards.length - 1) {
        this.currentIndex++;
        this.resetState();
      } else {
        this.endGame();
      }
    }, 800);
  } else {
    this.feedback = 'incorrect';
    this.score = Math.max(0, this.score - 1); // Ne jamais descendre en dessous de 0
    this.audioIncorrect?.play().catch(e => console.warn('Audio play failed:', e));

  }
}

endGame() {
  console.log('🎯 [DEBUG] endGame appelé, score:', this.score);
  if (this.currentUserId) {
    console.log('👤 [DEBUG] Utilisateur trouvé:', this.currentUserId);
    const historyEntry = {
      userId: this.currentUserId,
      gameMode: this.gameMode,
      score: this.score,
      maxScore: this.flashcards.length * 10,
      date: new Date().toISOString(),
    };
    console.log('💾 [DEBUG] Envoi de l\'historique:', historyEntry);
    this.historyService.addHistory(historyEntry).subscribe({
      next: () => console.log('✅ Historique sauvegardé'),
      error: (err) => console.error('❌ Erreur sauvegarde historique:', err)
    });
  } else {
    console.log('❌ [DEBUG] Aucun utilisateur connecté');
  }
  // Sauvegarde finale du meilleur score
  if (this.score > this.bestScore) {
    this.bestScore = this.score;
    localStorage.setItem('bestScore', this.bestScore.toString());
  }
  alert(`🎉 Quiz terminé !\nVotre score : ${this.score}\nMeilleur score : ${this.bestScore}`);
  // ❌ NE RÉINITIALISE PAS LE JEU
  // this.currentIndex = 0;
  // this.score = 0;
  this.resetState();
}

  resetState() {
  this.selectedOptionIndex = null;
  this.feedback = null;
}

resetQuestionState() {
  this.selectedOptionIndex = null;
  this.feedback = null;
  this.isDisabled = false;
}
  // --- Gestion du modal (ajout simplifié) ---
  openModal() {
  this.newQuestion = '';
  this.newOptions = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
  ];
  this.isModalOpen = true;
}

closeModal() {
  this.isModalOpen = false;
}
closeManageModal() {
  this.isManageModalOpen = false;
}

  resetNewFlashcard() {
    this.newQuestion = '';
    this.newOptions = [{ text: '', isCorrect: true }, { text: '', isCorrect: false }];
  }
  onLogin() {
    console.log('Login');
  }
  onRegister() {
    console.log('Register');
  }
getOptionColor(index: number): string {
  if (this.feedback === null) return ''; // neutre
  if (this.selectedOptionIndex !== index) return ''; // non sélectionné

  return this.flashcards[this.currentIndex].options[index].isCorrect
    ? 'success'
    : 'danger';
}
  getLetter(index: number): string {
  return ['A', 'B', 'C', 'D'][index] || '?';
  }

// Utilisateur
currentUser: User | null = null;
score = 0;
scores = { player1: 0, player2: 0 };
bestScore = 0;
gameMode: 'solo' | 'multi' = 'solo';

// Ajouter une option (max 5)
addOption() {
  if (this.newOptions.length < 5) {
    this.newOptions.push({ text: '', isCorrect: false });
  }
}

// Supprimer une option (min 2)
removeOption(index: number) {
  if (this.newOptions.length > 2) {
    const removed = this.newOptions.splice(index, 1)[0];
    // Si on supprime la bonne réponse, en activer une autre
    if (removed.isCorrect) {
      this.newOptions[0].isCorrect = true;
    }
  }
}

// Définir quelle option est correcte
setCorrect(index: number) {
  this.newOptions.forEach((opt, i) => {
    opt.isCorrect = (i === index);
  });
}

saveNewFlashcard() {
  const question = this.newQuestion.trim();
  const options = this.newOptions
    .map(opt => ({ text: opt.text.trim(), isCorrect: opt.isCorrect }))
    .filter(opt => opt.text); // Ignore les réponses vides
  if (!question) {
    alert('Veuillez entrer une question.');
    return;
  }
  if (options.length < 2) {
    alert('Veuillez entrer au moins 2 réponses.');
    return;
  }
  const correctCount = options.filter(opt => opt.isCorrect).length;
  if (correctCount !== 1) {
    alert('Veuillez sélectionner exactement une bonne réponse.');
    return;
  }

  this.flashcardService.createFlashcard({ question, options }).subscribe({
    next: () => {
      this.loadFlashcards();
      this.closeModal();
    },
    error: (err) => {
      console.error('Erreur:', err);
      alert('Erreur lors de l’enregistrement.');
    }
  });
}

  // Dans la classe HomePage
isManageModalOpen = false;

openManageModal() {
  if (!this.authService.isAdmin) return;
  this.isManageModalOpen = true;
  // On recharge les flashcards pour être à jour
  this.loadFlashcards();
}

  // Pour l'édition
isEditModalOpen = false;
editingCard: any = null;
editQuestion = '';
editOptions: { text: string; isCorrect: boolean }[] = [];

// Ouvrir le modal d'édition
openEditModal(card: any) {
  this.editingCard = card;
  this.editQuestion = card.question;
  this.editOptions = card.options.map((opt: any) => ({
    text: opt.text,
    isCorrect: opt.isCorrect
  }));
  this.isEditModalOpen = true;
  this.closeManageModal(); // Ferme le modal de gestion
}
goToProfile() {
  this.router.navigate(['/profile']);
}
// Sauvegarder les modifications
saveEdit() {
  const question = this.editQuestion.trim();
  const options = this.editOptions
    .map(opt => ({ text: opt.text.trim(), isCorrect: opt.isCorrect }))
    .filter(opt => opt.text);

  if (!question || options.length < 2 || options.filter(o => o.isCorrect).length !== 1) {
    alert('Veuillez remplir correctement la question et les réponses.');
    return;
  }

  this.flashcardService.updateFlashcard(this.editingCard._id, { question, options }).subscribe({
    next: () => {
      this.loadFlashcards();
      this.isEditModalOpen = false;
      this.openManageModal(); // Réouvre le modal de gestion
    },
    error: (err) => {
      console.error('Erreur:', err);
      alert('Erreur lors de la modification.');
    }
  });
}

// Confirmer la suppression
confirmDelete(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette flashcard ?')) {
    this.deleteFlashcard(id);
  }
}

// Supprimer une flashcard
deleteFlashcard(id: string) {
  this.flashcardService.deleteFlashcard(id).subscribe({
    next: () => {
      this.loadFlashcards();
      // Le modal de gestion se mettra à jour automatiquement
    },
    error: (err) => {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression.');
    }
  });
}

// Fermer le modal d'édition
closeEditModal() {
  this.isEditModalOpen = false;
  this.openManageModal(); // Réouvre le modal de gestion
}
  // Méthodes pour l'édition
setEditCorrect(index: number) {
  this.editOptions.forEach((opt, i) => {
    opt.isCorrect = (i === index);
  });
}

addEditOption() {
  if (this.editOptions.length < 5) {
    this.editOptions.push({ text: '', isCorrect: false });
  }
}

removeEditOption(index: number) {
  if (this.editOptions.length > 2) {
    const removed = this.editOptions.splice(index, 1)[0];
    if (removed.isCorrect && this.editOptions.length > 0) {
      this.editOptions[0].isCorrect = true;
    }
  }
}


  invitePlayer(userId: string) {
  if (!this.authService.isAdmin && this.gameMode !== 'multi') {
    // Pour l'instant, on force le mode multi pour tous
    this.gameMode = 'multi';
  }
  const gameId = Date.now().toString();
  }

 startMultiplayerGame(game: { gameId: string; player1: string; player2: string }) {
  this.isInGame = true;
  this.currentGameId = game.gameId;
  this.gameMode = 'multi';
  this.gameStarted = true;

  const currentUser = this.authService.currentUserValue;
  if (currentUser) {
    this.player1 = currentUser;
    // Identifier l'adversaire
    const opponentId = game.player1 === currentUser.id ? game.player2 : game.player1;
    this.player2 = { id: opponentId, name: 'Adversaire', email: '' };
    this.currentPlayer = 'player1';
  }

  this.resetState();
  this.currentIndex = 0;
 }

  openMultiplayer() {
  this.router.navigate(['/multiplayer']);
}
  // Dans la classe HomePage
onLogout() {
  this.authService.logout();
}
}
