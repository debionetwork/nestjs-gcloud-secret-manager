import { DynamicModule, Global, Module } from '@nestjs/common';
import { GCLOUD_SECRET_MANAGER_PARENT } from './gcloud-secret-manager.constant';
import { GCloudSecretManagerService } from './gcloud-secret-manager.service';

@Global()
@Module({
  providers: [GCloudSecretManagerService],
  exports: [GCloudSecretManagerService],
})
export class GCloudSecretManagerModule {
  static async withConfig(parent: string): Promise<DynamicModule> {
    const secretListModuleOptions = {
      provide: GCLOUD_SECRET_MANAGER_PARENT,
      useValue: parent,
    };

    const gsmServiceProvider = {
      provide: GCloudSecretManagerService,
      useFactory: async (_parent: string) => await GCloudSecretManagerService.loadSecrets(_parent),
      inject: [GCLOUD_SECRET_MANAGER_PARENT],
    };

    return {
      module: GCloudSecretManagerModule,
      providers: [gsmServiceProvider, secretListModuleOptions],
      exports: [GCloudSecretManagerService],
    };
  }
}
