import { Response } from 'express';
import { TemplateService } from '../services/template.service';

export class TemplateController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  getAllTemplates = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { includePrivate } = req.query;

      const isPublicOnly = !includePrivate || includePrivate === 'false';

      const templates = await this.templateService.getAllTemplates(isPublicOnly);

      res.status(200).json({
        templates,
        count: templates.length,
      });
    } catch (error: any) {
      console.error('Error getting templates:', error);
      res.status(500).json({ error: 'Failed to get templates', details: error.message });
    }
  };

  getTemplate = async (req: any, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;

      const template = await this.templateService.getTemplate(templateId);

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      res.status(200).json({ template });
    } catch (error: any) {
      console.error('Error getting template:', error);
      res.status(500).json({ error: 'Failed to get template', details: error.message });
    }
  };

  getMyTemplates = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const templates = await this.templateService.getCreatorTemplates(userId);

      res.status(200).json({
        templates,
        count: templates.length,
      });
    } catch (error: any) {
      console.error('Error getting my templates:', error);
      res.status(500).json({ error: 'Failed to get templates', details: error.message });
    }
  };

  createTemplateFromQuest = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const template = await this.templateService.createTemplateFromQuest(req.body, userId);

      if (!template) {
        res.status(404).json({ error: 'Quest not found or unauthorized' });
        return;
      }

      res.status(201).json({
        success: true,
        template,
      });
    } catch (error: any) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template', details: error.message });
    }
  };

  createQuestFromTemplate = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { templateId } = req.params;
      const { title, description, tags } = req.body;

      const quest = await this.templateService.createQuestFromTemplate(templateId, userId, {
        title,
        description,
        tags,
      });

      if (!quest) {
        res.status(404).json({ error: 'Template not found or not accessible' });
        return;
      }

      res.status(201).json({
        success: true,
        quest,
        message: 'Quest created from template. Please update checkpoint locations before publishing.',
      });
    } catch (error: any) {
      console.error('Error creating quest from template:', error);
      res.status(500).json({ error: 'Failed to create quest from template', details: error.message });
    }
  };

  deleteTemplate = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { templateId } = req.params;

      const success = await this.templateService.deleteTemplate(templateId, userId);

      if (!success) {
        res.status(404).json({ error: 'Template not found, unauthorized, or is a system template' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template', details: error.message });
    }
  };

  updateTemplate = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { templateId } = req.params;

      const template = await this.templateService.updateTemplate(templateId, userId, req.body);

      if (!template) {
        res.status(404).json({ error: 'Template not found, unauthorized, or is a system template' });
        return;
      }

      res.status(200).json({ success: true, template });
    } catch (error: any) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template', details: error.message });
    }
  };
}
