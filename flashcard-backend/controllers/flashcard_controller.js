const Flashcard = require('../models/flashcard_model');
exports.createFlashcard = async (req, res) => {
console.log('Reçu du frontend:', req.body); // 👈 AJOUTE CETTE LIGNE
try {
const card = await Flashcard.create({
question: req.body.question,
answer: req.body.answer,
});
res.status(201).json({
status: 'success',
data: card,
});
} catch (error) {
res.status(400).json({ status: 'fail', message: error.message });
}
};
exports.getAllFlashcards = async (req, res) => {
try {
  const flashcards = await Flashcard.find();
  console.log('📊 [BACKEND] Nombre total de flashcards envoyées:', flashcards.length);
    console.log('📝 [BACKEND] Extrait des IDs:', flashcards.slice(0, 5).map(f => f._id)); // Affiche les 5 premiers IDs
res.status(200).json({
status: 'success',
data: flashcards,
});
} catch (error) {
res.status(500).json({ status: 'fail', message: error.message });
}
};
exports.updateFlashcard = async (req, res) => {
try {
const flashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body,     {
new: true,
runValidators: true,
});
if (!flashcard) {
return res.status(404).json({status:'fail',message:'No flashcard found with that ID'});
}
res.status(200).json({
  status: 'success',
data: flashcard,
});
} catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
}};
exports.deleteFlashcard = async (req, res) => {
try {
const flashcard = await Flashcard.findByIdAndDelete(req.params.id);
if (!flashcard) {
return res.status(404).json({status:'fail',message:'No flashcard found with that ID' });
}
res.status(204).json({
status: 'success',
data: null,
});
} catch (error) {
 res.status(500).json({ status: 'fail', message: error.message });
}
};



