import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { GoogleCloudKeyValue } from './interface/gcloud-key-value.interface';

@Injectable()
export class GCloudSecretManagerService<T> {
  private static _gCloudSecretManagerService: GCloudSecretManagerService<any>;
  private _secretsList: Map<T, string>;

  constructor(secretsList: Map<T, string>) {
    this._secretsList = secretsList;
  }

  static async loadSecrets(parent: string, listKeyValue: GoogleCloudKeyValue) {
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

          const valueOfKey = listKeyValue[envId];

          if (valueOfKey !== undefined) {
            const [version] = await client.accessSecretVersion({
              name: `${secret.name}/versions/latest`,
            });
            const value = version.payload.data.toString();
            secretsList.set(envId, valueOfKey ?? value);
          }
        }

        this._gCloudSecretManagerService = new GCloudSecretManagerService(secretsList);
      } catch (err) {
        this._gCloudSecretManagerService = new GCloudSecretManagerService(new Map(Object.entries(listKeyValue)));
        return this._gCloudSecretManagerService;
      }
    }

    return this._gCloudSecretManagerService;
  }

  getSecret(key: T): String {
    if (this._secretsList.size <= 0) throw new Error('Secrets are not loaded');
    return this._secretsList.get(key);
  }
}
