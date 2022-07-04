import { Test, TestingModule } from '@nestjs/testing';
import { GCloudSecretManagerModule } from '../lib/gcloud-secret-manager.module';
import { GCloudSecretManagerService } from '../lib/gcloud-secret-manager.service';

describe('GCloudSecretManagerModule', () => {
  let module: TestingModule;
  let gcloudSecretManagerService: GCloudSecretManagerService;
  
  const parent = process.env.PARENT ?? "";

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        GCloudSecretManagerModule.withConfig(parent)
      ],
    }).compile();

    gcloudSecretManagerService = module.get(GCloudSecretManagerService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    // Assert
    expect(gcloudSecretManagerService).toBeDefined();
  });

  it('loadSecrets: should return', async () => {
    // Assert
    await gcloudSecretManagerService.loadSecrets();
  });

  it('loadSecrets: should be defined', async () => {
    // Arrange
    await gcloudSecretManagerService.loadSecrets();

    // Assert
    expect(gcloudSecretManagerService.getSecret("POSTGRES_HOST")).toBeDefined();
  });
});
