export interface FlashcardOption {
  text: string;
  isCorrect: boolean;
}
export interface Flashcard {
    _id: string;
    question: string;
    options: FlashcardOption[]; // ✅ Doit être présent
    createdAt: string;
    updatedAt: string;
    isFlipped?: boolean;
    fadeOut?: boolean;
}

export interface FlashcardResponse {
    status: string;
    data: Flashcard[];
}
