import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from './HttpContext';
import { InstructorController } from '../controllers/InstructorController';
import { PRESENTATION_TYPES } from '../di/presentationTypes';

@injectable()
export class InstructorHttpAdapter {
  constructor(
    @inject(PRESENTATION_TYPES.InstructorController)
    private readonly instructorController: InstructorController,
  ) {}

  async apply(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as {
      bio: string;
      experienceYears: string;
      teachingExperience: 'yes' | 'no';
      courseIntent: string;
      level: 'beginner' | 'intermediate' | 'advanced';
      language: string;
    };
    const result = await this.instructorController.apply({ userId: req.user!.userId, ...body });
    res.status(201).json(result);
  }

  async getStatus(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.instructorController.getStatus(req.user!.userId);
    res.status(200).json(result);
  }

  async listApplications(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { page, limit, status } = req.query;
    const result = await this.instructorController.listApplications({
      page:   page  ? parseInt(page,  10) : undefined,
      limit:  limit ? parseInt(limit, 10) : undefined,
      status: (status || undefined) as 'pending' | 'approved' | 'rejected' | undefined,
    });
    res.status(200).json(result);
  }


  async approveApplication(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.instructorController.approveApplication(req.params.applicationId);
    res.status(200).json(result);
  }

  async rejectApplication(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { reason } = req.body as { reason: string };
    const result = await this.instructorController.rejectApplication(req.params.applicationId, reason);
    res.status(200).json(result);
  }
}