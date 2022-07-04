import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class GCloudSecretManagerService {
  private readonly logger: Logger = new Logger(GCloudSecretManagerService.name);
  private _client: SecretManagerServiceClient;
  private _readConfig: boolean = false;

  private _parentSecrets: string;
  private _secretsList: Map<string, string> = new Map<string, string>();
  private _secretsLoaded: boolean = false;

  constructor(parent: string) {
    this._parentSecrets = parent;
    this._client = new SecretManagerServiceClient();
  }

  async loadSecrets() {
    if (this._readConfig) return;
    try {
      this._readConfig = true;

      const [secrets] = await this._client.listSecrets({
        parent: this._parentSecrets,
      });

      for (let i = 0; i < secrets.length; i++) {
        const secret = secrets[i];
        const arrPath = secret.name.split('/');
        const envId = arrPath.slice(-1)[0];
        const [version] = await this._client.accessSecretVersion({
          name: `${secret.name}/versions/latest`,
        });
        const value = version.payload.data.toString();
        this._secretsList.set(envId, value);
      }

      this._secretsLoaded = true;
    } catch (err) {
      this.logger.log(err);
      throw new Error(err);
    } finally {
      this._readConfig = false;
    }
  }

  getSecret(key: string): String {
    if(!this._secretsLoaded) throw new Error("Secrets are not loaded");
    return this._secretsList.get(key);
  }
}
