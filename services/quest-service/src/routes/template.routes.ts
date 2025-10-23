import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';

const router = Router();
const templateController = new TemplateController();

// Public routes
router.get('/', templateController.getAllTemplates);
router.get('/:templateId', templateController.getTemplate);

// Protected routes (require authentication)
router.get('/my/templates', templateController.getMyTemplates);
router.post('/', templateController.createTemplateFromQuest);
router.post('/:templateId/create-quest', templateController.createQuestFromTemplate);
router.put('/:templateId', templateController.updateTemplate);
router.delete('/:templateId', templateController.deleteTemplate);

export default router;
