import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class GCloudSecretManagerService {
  private _secretsList: Map<string, string>;

  constructor(secretsList: Map<string, string>) {
    this._secretsList = secretsList;
  }

  getSecret(key: string): String {
    if (this._secretsList.size <= 0) throw new Error('Secrets are not loaded');
    return this._secretsList.get(key);
  }
}
