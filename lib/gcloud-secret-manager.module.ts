import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { DynamicModule, Module } from '@nestjs/common';
import { GCLOUD_SECRET_MANAGER_LIST } from './gcloud-secret-manager.constant';
import { GCloudSecretManagerService } from './gcloud-secret-manager.service';

@Module({
  providers: [GCloudSecretManagerService],
  exports: [GCloudSecretManagerService],
})
export class GCloudSecretManagerModule {
  static async withConfig(parent: string): Promise<DynamicModule> {
    const secretsList: Map<string, string> = new Map<string, string>();
    const client: SecretManagerServiceClient = new SecretManagerServiceClient();

    try {
      const [secrets] = await client.listSecrets({
        parent: parent,
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
    } catch (err) {
      throw new Error(err);
    }

    const secretListModuleOptions = {
      provide: GCLOUD_SECRET_MANAGER_LIST,
      useValue: secretsList,
    };

    const gsmServiceProvider = {
      provide: GCloudSecretManagerService,
      useFactory: (_secretslist: Map<string, string>) => new GCloudSecretManagerService(_secretslist),
      inject: [GCLOUD_SECRET_MANAGER_LIST],
    };

    return {
      module: GCloudSecretManagerModule,
      providers: [gsmServiceProvider, secretListModuleOptions],
      exports: [GCloudSecretManagerService],
    };
  }
}
