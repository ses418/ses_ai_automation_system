import { supabase } from '@/lib/supabase';
import { 
  Project, 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectFilters,
  ProjectMilestone,
  ProjectDeliverable,
  ProjectResource,
  PROJECT_CATEGORIES,
  PROJECT_TAGS
} from '@/types/projects';

export class ProjectService {
  // Get all projects with optional filtering
  static async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          client:clients(name, company),
          project_manager:team_members(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters?.project_manager) {
        query = query.eq('project_manager', filters.project_manager);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.date_range) {
        query = query.gte('start_date', filters.date_range.start)
                    .lte('start_date', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  }

  // Get a single project by ID with full details
  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name, company, email, phone),
          project_manager:team_members(name, email, phone),
          milestones:project_milestones(*),
          deliverables:project_deliverables(*),
          resources:project_resources(
            *,
            team_member:team_members(name, email, role)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  }

  // Create a new project
  static async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  }

  // Update an existing project
  static async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  }

  // Delete a project
  static async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        throw new Error(`Failed to delete project: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }

  // Get project milestones
  static async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching project milestones:', error);
        throw new Error(`Failed to fetch project milestones: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjectMilestones:', error);
      throw error;
    }
  }

  // Create a new project milestone
  static async createProjectMilestone(milestoneData: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectMilestone> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert([milestoneData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project milestone:', error);
        throw new Error(`Failed to create project milestone: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createProjectMilestone:', error);
      throw error;
    }
  }

  // Update project milestone
  static async updateProjectMilestone(id: string, milestoneData: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .update(milestoneData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project milestone:', error);
        throw new Error(`Failed to update project milestone: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateProjectMilestone:', error);
      throw error;
    }
  }

  // Get project deliverables
  static async getProjectDeliverables(projectId: string): Promise<ProjectDeliverable[]> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching project deliverables:', error);
        throw new Error(`Failed to fetch project deliverables: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjectDeliverables:', error);
      throw error;
    }
  }

  // Create a new project deliverable
  static async createProjectDeliverable(deliverableData: Omit<ProjectDeliverable, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectDeliverable> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .insert([deliverableData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project deliverable:', error);
        throw new Error(`Failed to create project deliverable: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createProjectDeliverable:', error);
      throw error;
    }
  }

  // Update project deliverable
  static async updateProjectDeliverable(id: string, deliverableData: Partial<ProjectDeliverable>): Promise<ProjectDeliverable> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .update(deliverableData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project deliverable:', error);
        throw new Error(`Failed to update project deliverable: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateProjectDeliverable:', error);
      throw error;
    }
  }

  // Get project resources
  static async getProjectResources(projectId: string): Promise<ProjectResource[]> {
    try {
      const { data, error } = await supabase
        .from('project_resources')
        .select(`
          *,
          team_member:team_members(name, email, role, department)
        `)
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching project resources:', error);
        throw new Error(`Failed to fetch project resources: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjectResources:', error);
      throw error;
    }
  }

  // Create a new project resource
  static async createProjectResource(resourceData: Omit<ProjectResource, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectResource> {
    try {
      const { data, error } = await supabase
        .from('project_resources')
        .insert([resourceData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project resource:', error);
        throw new Error(`Failed to create project resource: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createProjectResource:', error);
      throw error;
    }
  }

  // Update project resource
  static async updateProjectResource(id: string, resourceData: Partial<ProjectResource>): Promise<ProjectResource> {
    try {
      const { data, error } = await supabase
        .from('project_resources')
        .update(resourceData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project resource:', error);
        throw new Error(`Failed to update project resource: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateProjectResource:', error);
      throw error;
    }
  }

  // Get project analytics and metrics
  static async getProjectAnalytics(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    totalBudget: number;
    totalSpent: number;
    averageProgress: number;
    categoryBreakdown: { category: string; count: number }[];
    statusBreakdown: { status: string; count: number }[];
    priorityBreakdown: { priority: string; count: number }[];
    overdueMilestones: number;
    upcomingDeliverables: number;
  }> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*');

      if (error) {
        console.error('Error fetching projects for analytics:', error);
        throw new Error(`Failed to fetch project analytics: ${error.message}`);
      }

      if (!projects) return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        onHoldProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        averageProgress: 0,
        categoryBreakdown: [],
        statusBreakdown: [],
        priorityBreakdown: [],
        overdueMilestones: 0,
        upcomingDeliverables: 0
      };

      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (p.spent_amount || 0), 0);
      const averageProgress = projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalProjects;

      // Category breakdown
      const categoryMap = new Map<string, number>();
      projects.forEach(project => {
        const count = categoryMap.get(project.category) || 0;
        categoryMap.set(project.category, count + 1);
      });
      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

      // Status breakdown
      const statusMap = new Map<string, number>();
      projects.forEach(project => {
        const count = statusMap.get(project.status) || 0;
        statusMap.set(project.status, count + 1);
      });
      const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

      // Priority breakdown
      const priorityMap = new Map<string, number>();
      projects.forEach(project => {
        const count = priorityMap.get(project.priority) || 0;
        priorityMap.set(project.priority, count + 1);
      });
      const priorityBreakdown = Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count }));

      // Get overdue milestones and upcoming deliverables
      const today = new Date();
      const { data: milestones } = await supabase
        .from('project_milestones')
        .select('due_date, status')
        .lt('due_date', today.toISOString())
        .neq('status', 'completed');

      const { data: deliverables } = await supabase
        .from('project_deliverables')
        .select('due_date')
        .gte('due_date', today.toISOString())
        .lte('due_date', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

      const overdueMilestones = milestones?.length || 0;
      const upcomingDeliverables = deliverables?.length || 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalBudget,
        totalSpent,
        averageProgress,
        categoryBreakdown,
        statusBreakdown,
        priorityBreakdown,
        overdueMilestones,
        upcomingDeliverables
      };
    } catch (error) {
      console.error('Error in getProjectAnalytics:', error);
      throw error;
    }
  }

  // Get projects requiring attention (overdue milestones, low progress, etc.)
  static async getProjectsRequiringAttention(): Promise<Project[]> {
    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`status.eq.active,status.eq.planning`)
        .or(`progress_percentage.lt.25,progress_percentage.lt.50`)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching projects requiring attention:', error);
        throw new Error(`Failed to fetch projects requiring attention: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjectsRequiringAttention:', error);
      throw error;
    }
  }

  // Get team member workload across projects
  static async getTeamMemberWorkload(teamMemberId: string): Promise<{
    totalAllocation: number;
    projects: { project: Project; allocation: number; role: string }[];
  }> {
    try {
      const { data: resources, error } = await supabase
        .from('project_resources')
        .select(`
          allocation_percentage,
          role,
          project:projects(*)
        `)
        .eq('team_member_id', teamMemberId);

      if (error) {
        console.error('Error fetching team member workload:', error);
        throw new Error(`Failed to fetch team member workload: ${error.message}`);
      }

      const totalAllocation = resources?.reduce((sum, r) => sum + (r.allocation_percentage || 0), 0) || 0;
      const projects = resources?.map(r => ({
        project: r.project,
        allocation: r.allocation_percentage || 0,
        role: r.role
      })) || [];

      return { totalAllocation, projects };
    } catch (error) {
      console.error('Error in getTeamMemberWorkload:', error);
      throw error;
    }
  }

  // Get available categories and tags
  static getAvailableCategories(): string[] {
    return PROJECT_CATEGORIES;
  }

  static getAvailableTags(): string[] {
    return PROJECT_TAGS;
  }
}
