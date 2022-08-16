import { Test, TestingModule } from '@nestjs/testing';
import { GCloudSecretManagerModule } from '../lib/gcloud-secret-manager.module';
import { GCloudSecretManagerService } from '../lib/gcloud-secret-manager.service';

describe('GCloudSecretManagerModule', () => {
  let module: TestingModule;

  const DB_LOCATIONS = 'VALUE_DB_POSTGRES_LOCATION';

  let listKey = {
    POSTGRES_HOST: null,
    DB_LOCATIONS: DB_LOCATIONS,
    REDIS_HOST: null,
  } as const;

  type keys = keyof typeof listKey;

  let gcloudSecretManagerService: GCloudSecretManagerService<keys>;

  const parent = process.env.PARENT ?? '';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [GCloudSecretManagerModule.withConfig(parent, listKey)],
    }).compile();

    gcloudSecretManagerService = module.get(GCloudSecretManagerService);
  }, 60000);

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    // Assert
    expect(gcloudSecretManagerService).toBeDefined();
  });

  it('getSecret: should be get value', async () => {
    // Assert
    expect(gcloudSecretManagerService.getSecret('POSTGRES_HOST')).toBeDefined();
  }, 40000);

  it('getSecret: should get value from listKey', async () => {
    // Assert
    expect(gcloudSecretManagerService.getSecret('DB_LOCATIONS')).toEqual(DB_LOCATIONS);
  }, 40000);
});
