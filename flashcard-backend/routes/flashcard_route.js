const express = require('express');
const flashcard = require('../controllers/flashcard_controller'); 
const cardRoutes = express.Router();
cardRoutes.post('/', flashcard.createFlashcard);
cardRoutes.get('/get', flashcard.getAllFlashcards);
cardRoutes.patch('/update/:id', flashcard.updateFlashcard);
cardRoutes.delete('/delete/:id', flashcard.deleteFlashcard);
module.exports = cardRoutes;
