// cache_service.ts 

interface CacheOptions {
    cacheKey: 'monteCarlo' | 'sde' | 'pde';
    project: any;
    onProjectUpdate?: (project: any) => void;
  }
  
  export class AnalyticsCacheService {
    
    // Load cached results
    static loadFromCache(project: any, cacheKey: string): any | null {
      if (!project.analyticsCache?.[cacheKey]) {
        console.log(`No cached ${cacheKey} results found`);
        return null;
      }
      
      console.log(`✅ Loading cached ${cacheKey} results`);
      return project.analyticsCache[cacheKey];
    }
    
    // Save results to cache
    static async saveToCache(options: CacheOptions, data: any): Promise<void> {
        const { cacheKey, project, onProjectUpdate } = options;
        

        console.log(`🔍 Before merge - project.analyticsCache:`, {
            keys: Object.keys(project.analyticsCache || {}),
            hasCache: !!project.analyticsCache
          });

        const updatedProject = {
          ...project,
          analyticsCache: {
            ...project.analyticsCache,
            [cacheKey]: data,
            lastCalculated: {
              ...project.analyticsCache?.lastCalculated,
              [cacheKey]: new Date().toISOString()
            }
          }
        };

        if (onProjectUpdate) {
            onProjectUpdate(updatedProject);
            console.log(`✅ ${cacheKey} updated in memory`);
          }
        
        try {
          console.log(`💾 Saving ${cacheKey} to cache...`);

          console.log(`🔍 After merge - updatedProject.analyticsCache:`, {
            keys: Object.keys(updatedProject.analyticsCache || {}),
            hasMC: !!updatedProject.analyticsCache.monteCarlo,
            hasSDE: !!updatedProject.analyticsCache.sde,
            hasPDE: !!updatedProject.analyticsCache.pde
          });
          
          // ✅ CLEAN THE TASKS - Only send fields backend expects
          const cleanTasks = updatedProject.tasks.map(task => ({
            id: task.id,
            name: task.name,
            duration_days: task.duration_days,
            predecessors: task.predecessors || [],
            user_risk_rating: task.user_risk_rating,
            completion_pct: task.completion_pct || 0,
            owner: task.owner || null
          }));
          
          // Log what we're sending (for debugging)
          console.log(`📤 Sending to backend:`, {
            taskCount: cleanTasks.length,
            hasCacheData: !!updatedProject.analyticsCache,
            cacheKeys: Object.keys(updatedProject.analyticsCache || {})
          });
          
          const response = await fetch('https://anispulse2.onrender.com/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: updatedProject.id || Date.now().toString(),
              name: updatedProject.name,
              description: updatedProject.description || "",
              project_start_date: updatedProject.project_start_date,
              tasks: cleanTasks,  // ✅ Use cleaned tasks
              foundationResults: updatedProject.foundationResults || null,
              analyticsCache: updatedProject.analyticsCache || null,
              created: updatedProject.created || new Date().toISOString(),
              lastModified: new Date().toISOString()
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Backend save failed: ${response.status}`, errorText);
            throw new Error(`Backend save failed: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`✅ ${cacheKey} persisted to MongoDB`, result);
      


          
        } catch (error) {
          console.error(`Failed to persist ${cacheKey}:`, error);
          // Don't throw - keep the data in memory even if backend save fails
          if (onProjectUpdate) {
            onProjectUpdate(updatedProject);
            console.log(`⚠️ ${cacheKey} kept in memory (backend save failed)`);
          }
        }
      }
    
    // Check if cache is stale (optional - for future use)
    static isCacheStale(project: any, cacheKey: string, maxAgeHours: number = 24): boolean {
      const lastCalc = project.analyticsCache?.lastCalculated?.[cacheKey];
      if (!lastCalc) return true;
      
      const ageMs = Date.now() - new Date(lastCalc).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      
      return ageHours > maxAgeHours;
    }
  }