import { DynamicModule, Module } from '@nestjs/common';
import { GCLOUD_SECRET_MANAGER_PARENT } from './gcloud-secret-manager.constant';
import { GCloudSecretManagerService } from './gcloud-secret-manager.service';

@Module({
  providers: [GCloudSecretManagerService],
  exports: [GCloudSecretManagerService],
})
export class GCloudSecretManagerModule {
  static withConfig(parent: string): DynamicModule {
    const gsmModuleOptions = {
      provide: GCLOUD_SECRET_MANAGER_PARENT,
      useValue: parent,
    };

    const gsmServiceProvider = {
      provide: GCloudSecretManagerService,
      useFactory: (parent: string) => new GCloudSecretManagerService(parent),
      inject: [GCLOUD_SECRET_MANAGER_PARENT],
    };

    return {
      module: GCloudSecretManagerModule,
      providers: [gsmModuleOptions, gsmServiceProvider],
      exports: [GCloudSecretManagerService],
    };
  }
}
