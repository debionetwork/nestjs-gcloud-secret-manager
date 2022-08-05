import { DynamicModule, Global, Module } from '@nestjs/common';
import { GCLOUD_SECRET_KEY_AND_VALUE, GCLOUD_SECRET_MANAGER_PARENT } from './gcloud-secret-manager.constant';
import { GCloudSecretManagerService } from './gcloud-secret-manager.service';
import { GoogleCloudKeyValue } from './interface/gcloud-key-value.interface';

@Global()
@Module({
  providers: [GCloudSecretManagerService],
  exports: [GCloudSecretManagerService],
})
export class GCloudSecretManagerModule {
  static async withConfig(parent: string, listKeyValue: GoogleCloudKeyValue): Promise<DynamicModule> {
    const secretListModuleOptions = {
      provide: GCLOUD_SECRET_MANAGER_PARENT,
      useValue: parent,
    };

    const googleCloudKeyValue = {
      provide: GCLOUD_SECRET_KEY_AND_VALUE,
      useValue: listKeyValue,
    };

    const gsmServiceProvider = {
      provide: GCloudSecretManagerService,
      useFactory: async (_parent: string, _listKeyValue: GoogleCloudKeyValue) =>
        await GCloudSecretManagerService.loadSecrets(_parent, _listKeyValue),
      inject: [GCLOUD_SECRET_MANAGER_PARENT, GCLOUD_SECRET_KEY_AND_VALUE],
    };

    return {
      module: GCloudSecretManagerModule,
      providers: [gsmServiceProvider, secretListModuleOptions, googleCloudKeyValue],
      exports: [GCloudSecretManagerService],
    };
  }
}
