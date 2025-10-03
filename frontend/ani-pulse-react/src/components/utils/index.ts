// src/utils/index.ts
// Clean, centralized exports for all utility functions

// Foundation Engine adapter (mystical UI transformations)
import foundationEngineAdapter from './foundationEngineAdapter';

// Data mapper (clean API transformations)
export { DataMapper } from './dataMapper';

// Re-export foundation adapter
export { foundationEngineAdapter };

// Type exports for clean imports
export type {
  BackendTask,
  BackendProjectRequest,
  BackendProjectResponse,
  FrontendTask,
  FrontendProject
} from './dataMapper';

// Clean imports in components:
// import { DataMapper, foundationEngineAdapter, type FrontendProject } from '../utils';