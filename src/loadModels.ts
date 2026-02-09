import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load all Mongoose models from the drivio-web-service
 * This allows the MCP server to access all registered models
 * 
 * Note: Some models may have dependencies on config files.
 * For query-only operations, we can work with the models even if
 * some dependencies are missing.
 */
export function loadModels(): boolean {
  try {
    // Path to the models directory in drivio-web-service
    const modelsPath = join(__dirname, '../../drivio-web-service/database/mongoose/models');
    
    // Try to set up minimal environment for models that need config
    // This is a fallback - models should ideally work without full config for queries
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
    }
    
    // Load the models index file which loads all models
    // This uses require() to load CommonJS modules
    require(join(modelsPath, 'index.js'));
    
    console.error('Models loaded successfully');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Warning: Error loading models from drivio-web-service:', errorMessage);
    console.error('The server will attempt to use models that are already registered with mongoose.');
    // If models can't be loaded from drivio-web-service, 
    // we'll rely on mongoose.model() to get already registered models
    // This might work if models were loaded elsewhere or if mongoose can infer from collections
    return false;
  }
}
