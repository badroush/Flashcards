// src/app/profile/profile.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HistoryService } from '../services/history.service';
import { HistoryEntry } from '../models/history.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common'; // Pour le retour arrière


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  currentUser: any = null;
  profileImage: string = 'assets/img/default-avatar.png';
  bestScore = 0;
  gameCount = 0;
  history: HistoryEntry[] = [];
  private authSubscription: Subscription | null = null;
  location: any;


  constructor(
    private authService: AuthService,
    private historyService: HistoryService,
    private router: Router
  ) {}

  ngOnInit() {
    // ✅ Utilise l'Observable pour être sûr de récupérer l'utilisateur
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        console.log('👤 [DEBUG] Utilisateur chargé dans le profil:', user.id);
        this.loadStats();
      } else {
        console.log('❌ [DEBUG] Aucun utilisateur connecté');
      }
    });
  }


  loadHistory() {
    if (this.currentUser) {
      this.historyService.getUserHistory(this.currentUser.id).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.history = res.data;
          }
        },
        error: (err) => console.error('Erreur chargement historique:', err)
      });
    }
  }

  // profile.page.ts

loadStats() {
  if (this.currentUser) {
    console.log('👤 [DEBUG] Chargement des stats pour:', this.currentUser.id);

    // Charger les stats depuis le backend
    this.historyService.getUserStats(this.currentUser.id).subscribe({
      next: (res) => {
        console.log('📊 [DEBUG] Réponse du backend:', res);

        if (res.status === 'success') {
          this.bestScore = res.data.bestScore;
          this.gameCount = res.data.gameCount;
          this.history = res.data.history;

          console.log('📈 [DEBUG] Stats chargées:', {
            bestScore: this.bestScore,
            gameCount: this.gameCount,
            historyLength: this.history.length
          });
        } else {
          console.error('❌ [DEBUG] Réponse inattendue:', res);
        }
      },
      error: (err) => {
        console.error('❌ [DEBUG] Erreur lors du chargement des stats:', err);
        console.error('Erreur détaillée:', err.message || err);
      }
    });
  } else {
    console.error('❌ [DEBUG] Aucun utilisateur connecté pour charger les stats');
  }
}

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  goBack() {
    this.location.back();
  }
  goHome() {
    this.router.navigate(['/home']);
  }
  // Dans la classe ProfilePage
  async selectImage() {
  console.log('📸 [DEBUG] Selection d’une image');
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Base64, // Pour afficher l'image immédiatement
      source: CameraSource.Prompt,         // Galerie ou caméra
    });
console.log('📸 [DEBUG] Image choisie:', photo);
    if (photo.base64String) {
      this.profileImage = 'data:image/jpeg;base64,' + photo.base64String;
      console.log('📸 [DEBUG] Image mise à jour');
    }
  } catch (e) {
    console.error('❌ [DEBUG] Erreur lors de la sélection de l’image:', e);
  }
}

}
