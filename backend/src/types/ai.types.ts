export interface AITask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AIGoalBreakdownResponse {
  tasks: AITask[];
}
