import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class GoogleSecretManagerService {
  private readonly logger: Logger = new Logger(GoogleSecretManagerService.name);
  private _client: SecretManagerServiceClient;
  private _readConfig: boolean = true;

  private _parentSecrets: string;
  private _secretsList: Map<string, string> = new Map<string, string>();
  private _secretsLoaded: boolean = false;

  constructor() {
    this._parentSecrets = "";
    this._client = new SecretManagerServiceClient();
  }

  async loadSecrets() {
    if (!this._readConfig) return;
    try {
      const [secrets] = await this._client.listSecrets({
        parent: this._parentSecrets,
      });

      for (let i = 0; i < secrets.length; i++) {
        const secret = secrets[i];
        const arrPath = secret.name.split('/');
        const envId = arrPath.at(-1);
        const [version] = await this._client.accessSecretVersion({
          name: `${secret.name}/versions/latest`,
        });
        const value = version.payload.data.toString();
        this._secretsList.set(envId, value);
      }

      this._secretsLoaded = true;
    } catch (err) {
      this.logger.log(err);
    } finally {
      this._readConfig = false;
    }
  }

  getSecret(key: string): String {
    if(!this._secretsLoaded) throw new Error("Secrets are not loaded");
    return this._secretsList.get(key);
  }
}
