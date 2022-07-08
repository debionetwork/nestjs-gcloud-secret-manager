import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class GCloudSecretManagerService {
  private static _gCloudSecretManagerService: GCloudSecretManagerService;
  private _secretsList: Map<string, string>;

  constructor(secretsList: Map<string, string>) {
    this._secretsList = secretsList;
  }

  static async loadSecrets(parent: string) {
    if (!this._gCloudSecretManagerService) {
      const secretsList: Map<string, string> = new Map<string, string>();
      const client: SecretManagerServiceClient = new SecretManagerServiceClient();

      try {
        const [secrets] = await client.listSecrets({
          parent,
        });

        for (const secret of secrets) {
          const arrPath = secret.name.split('/');
          const envId = arrPath.slice(-1)[0];
          const [version] = await client.accessSecretVersion({
            name: `${secret.name}/versions/latest`,
          });
          const value = version.payload.data.toString();
          secretsList.set(envId, value);
        }

        this._gCloudSecretManagerService = new GCloudSecretManagerService(secretsList);
      } catch (err) {
        throw new Error(err);
      }
    }

    return this._gCloudSecretManagerService;
  }

  getSecret(key: string): String {
    if (this._secretsList.size <= 0) throw new Error('Secrets are not loaded');
    return this._secretsList.get(key);
  }
}
