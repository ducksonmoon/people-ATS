import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

const execAsync = promisify(exec);
const logger = new Logger('MigrationGenerator');

/**
 * This script generates a Prisma migration for the schema changes:
 * 1. Adds the DepartmentGrowthPlan model
 * 2. Adds the strategicPriorities field to CompanySettings
 * 3. Adds the ActivityLog model
 */

async function generateMigration() {
  try {
    logger.log('Generating migration for schema changes...');

    // Get backend directory path
    const currentDir = __dirname;
    const backendDir = path.resolve(currentDir, '../../');

    logger.log(`Backend directory: ${backendDir}`);

    // Check if the schema file exists
    const schemaPath = path.join(backendDir, 'prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Prisma schema file not found at ${schemaPath}`);
    }

    logger.log('Prisma schema file found, generating migration...');

    // Run Prisma migration command
    const migrationName = 'add_growth_plans_and_activity_log';
    const migrationCommand = `cd ${backendDir} && npx prisma migrate dev --name ${migrationName} --create-only`;

    logger.log(`Running command: ${migrationCommand}`);
    const { stdout, stderr } = await execAsync(migrationCommand);

    if (stderr && !stderr.includes('migrations')) {
      logger.error('Error generating migration:');
      logger.error(stderr);
      throw new Error('Migration generation failed');
    }

    logger.log('Migration generated successfully:');
    logger.log(stdout);

    // Get the migration file path from the output
    const migrationDirMatch = stdout.match(/migrations\/(\d+_[^/\s]+)/);
    if (!migrationDirMatch) {
      logger.warn('Could not find migration directory in command output');
      return {
        success: true,
        message: 'Migration generated, but could not locate migration file',
      };
    }

    const migrationDir = migrationDirMatch[0];
    const migrationFilePath = path.join(
      backendDir,
      'prisma',
      migrationDir,
      'migration.sql',
    );

    if (fs.existsSync(migrationFilePath)) {
      logger.log(`Migration file generated at: ${migrationFilePath}`);

      // Read and display the migration SQL
      const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
      logger.log('Migration SQL:');
      logger.log(migrationSQL);
    } else {
      logger.warn(
        `Migration file not found at expected path: ${migrationFilePath}`,
      );
    }

    return {
      success: true,
      message: 'Migration generated successfully',
    };
  } catch (error) {
    logger.error(`Error generating migration: ${error.message}`, error.stack);
    return {
      success: false,
      message: `Failed to generate migration: ${error.message}`,
    };
  }
}

/**
 * Apply the migration to the database
 */
async function applyMigration() {
  try {
    logger.log('Applying migration to database...');

    // Get backend directory path
    const currentDir = __dirname;
    const backendDir = path.resolve(currentDir, '../../');

    // Run Prisma migration apply command
    const migrationCommand = `cd ${backendDir} && npx prisma migrate dev`;

    logger.log(`Running command: ${migrationCommand}`);
    const { stdout, stderr } = await execAsync(migrationCommand);

    if (
      stderr &&
      !stderr.includes('migrations') &&
      !stderr.includes('Already')
    ) {
      logger.error('Error applying migration:');
      logger.error(stderr);
      throw new Error('Migration application failed');
    }

    logger.log('Migration applied successfully:');
    logger.log(stdout);

    return {
      success: true,
      message: 'Migration applied successfully',
    };
  } catch (error) {
    logger.error(`Error applying migration: ${error.message}`, error.stack);
    return {
      success: false,
      message: `Failed to apply migration: ${error.message}`,
    };
  }
}

// Run generation and apply if this script is called directly
if (require.main === module) {
  (async () => {
    try {
      // First generate the migration
      const genResult = await generateMigration();
      if (!genResult.success) {
        process.exit(1);
      }

      // Ask user if they want to apply the migration
      logger.log('');
      logger.log(
        'Migration generated successfully. Do you want to apply it now? (yes/no)',
      );

      // This is a simple way to get user input in a script, but for production
      // you might want to use a proper CLI library like 'inquirer'
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', async (input) => {
        const answer = input.toString().trim().toLowerCase();

        if (answer === 'yes' || answer === 'y') {
          const applyResult = await applyMigration();
          if (applyResult.success) {
            logger.log('Migration process completed successfully!');
            process.exit(0);
          } else {
            process.exit(1);
          }
        } else {
          logger.log('Migration was not applied. You can apply it later with:');
          logger.log('  cd backend && npx prisma migrate dev');
          process.exit(0);
        }
      });
    } catch (error) {
      logger.error(`Unhandled error: ${error.message}`, error.stack);
      process.exit(1);
    }
  })();
}

export { generateMigration, applyMigration };
