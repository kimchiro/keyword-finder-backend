import { WorkflowService, WorkflowResult } from './workflow.service';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    executeCompleteWorkflow(query: string): Promise<WorkflowResult>;
    checkHealth(): Promise<any>;
}
