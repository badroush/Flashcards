const mongoose = require('mongoose');
const FlashcardSchema = new mongoose.Schema({
question: {
type: String,
required: true,
trim: true,
},
options: [ 
    {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, required: true }
    }
]
}, { timestamps: true });
module.exports = mongoose.model('Flashcard', FlashcardSchema);
