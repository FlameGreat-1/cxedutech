import express from 'express';
import { createFlashcardPack, updateFlashcardPack, deleteFlashcardPack, getFlashcardPacks, getFlashcardPackById } from '../controllers/productController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Admin routes for managing flashcard packs
router.use(authenticateAdmin);

router.post('/packs', createFlashcardPack);
router.put('/packs/:id', updateFlashcardPack);
router.delete('/packs/:id', deleteFlashcardPack);
router.get('/packs', getFlashcardPacks);
router.get('/packs/:id', getFlashcardPackById);

export default router;