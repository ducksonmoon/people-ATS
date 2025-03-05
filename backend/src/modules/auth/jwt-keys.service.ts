import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for JWT key entry
 */
interface JwtKeyEntry {
  id: string;
  secret: string;
  createdAt: Date;
  active: boolean;
}

/**
 * Service to manage JWT keys with rotation support
 */
@Injectable()
export class JwtKeysService {
  private readonly logger = new Logger(JwtKeysService.name);
  private keys: JwtKeyEntry[] = [];
  private readonly keysFile: string;
  private readonly keyRotationInterval: number; // in days

  constructor(private configService: ConfigService) {
    // Set up key file path and rotation interval
    this.keysFile = this.configService.get<string>(
      'JWT_KEYS_FILE',
      path.join(process.cwd(), 'jwt-keys.json'),
    );
    this.keyRotationInterval = parseInt(
      this.configService.get<string>('JWT_KEY_ROTATION_DAYS', '30'),
      10,
    );

    // Load or initialize keys
    this.initializeKeys();
  }

  /**
   * Initialize keys from storage or create a new one
   */
  private initializeKeys(): void {
    try {
      if (fs.existsSync(this.keysFile)) {
        const fileContent = fs.readFileSync(this.keysFile, 'utf-8');
        this.keys = JSON.parse(fileContent).map((key: any) => ({
          ...key,
          createdAt: new Date(key.createdAt),
        }));

        this.logger.log(`Loaded ${this.keys.length} JWT keys`);

        // Check if we need to rotate keys
        this.checkAndRotateKeys();
      } else {
        // Create first key
        this.generateNewKey();
      }
    } catch (error) {
      this.logger.error('Error initializing JWT keys:', error);
      // Fallback to create a new key
      this.keys = [];
      this.generateNewKey();
    }
  }

  /**
   * Generate and store a new key
   * @param activate Whether to activate the new key immediately
   * @returns The new key ID
   */
  private generateNewKey(activate = true): string {
    const keyId = crypto.randomUUID();

    // Use environment variable for production, or generate a random secret
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      crypto.randomBytes(64).toString('hex');

    const newKey: JwtKeyEntry = {
      id: keyId,
      secret,
      createdAt: new Date(),
      active: activate,
    };

    if (activate) {
      // Deactivate current active key
      this.keys.forEach((key) => {
        key.active = false;
      });
    }

    this.keys.push(newKey);
    this.saveKeys();

    this.logger.log(`Generated new JWT key with ID: ${keyId}`);
    return keyId;
  }

  /**
   * Save keys to storage
   */
  private saveKeys(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.keysFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.keysFile,
        JSON.stringify(this.keys, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.error('Error saving JWT keys:', error);
    }
  }

  /**
   * Check if keys need rotation and rotate if necessary
   */
  private checkAndRotateKeys(): void {
    const activeKey = this.getActiveKey();

    if (!activeKey) {
      this.logger.warn('No active JWT key found, generating a new one');
      this.generateNewKey();
      return;
    }

    const now = new Date();
    const keyAge = Math.floor(
      (now.getTime() - activeKey.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (keyAge >= this.keyRotationInterval) {
      this.logger.log(`Active JWT key is ${keyAge} days old, rotating...`);
      this.rotateKeys();
    } else {
      this.logger.debug(
        `Active JWT key is ${keyAge} days old, no rotation needed yet`,
      );
    }
  }

  /**
   * Rotate keys - generate a new key and mark it as active
   */
  public rotateKeys(): void {
    this.generateNewKey(true);

    // Cleanup old keys (keep last 2 for validation)
    if (this.keys.length > 3) {
      this.keys = this.keys.slice(-3);
      this.saveKeys();
    }
  }

  /**
   * Get the current active key
   * @returns The active JWT key or undefined if none found
   */
  public getActiveKey(): JwtKeyEntry | undefined {
    return this.keys.find((key) => key.active);
  }

  /**
   * Get active key secret for signing tokens
   * @returns The secret for the active key
   */
  public getActiveSecret(): string {
    const activeKey = this.getActiveKey();
    if (!activeKey) {
      this.logger.warn('No active key found, generating one');
      const newKeyId = this.generateNewKey();
      return this.keys.find((key) => key.id === newKeyId)!.secret;
    }
    return activeKey.secret;
  }

  /**
   * Get all secrets for token validation as an array
   * @returns Array of all secrets
   */
  public getAllSecrets(): string[] {
    return this.keys.map((key) => key.secret);
  }

  /**
   * Get all secrets for token validation as an object mapping key IDs to secrets
   * @returns Object mapping key IDs to secrets
   */
  public getSecretsMap(): { [key: string]: string } {
    const secretsMap: { [key: string]: string } = {};
    this.keys.forEach((key) => {
      secretsMap[key.id] = key.secret;
    });
    return secretsMap;
  }

  /**
   * Get active key ID for token header
   * @returns The active key ID
   */
  public getActiveKeyId(): string {
    const activeKey = this.getActiveKey();
    if (!activeKey) {
      this.logger.warn('No active key found, generating one');
      return this.generateNewKey();
    }
    return activeKey.id;
  }
}
