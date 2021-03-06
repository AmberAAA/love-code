import { Module } from '@nestjs/common';
import { BrowserDriveService } from './browser-drive.service';
import { OssService } from './oss.service';

@Module({
  providers: [
    {
      provide: 'BROWSER_DRIVER',
      useFactory: async () => {
        const browserDrive = new BrowserDriveService();
        await browserDrive.init();
        return browserDrive;
      },
    },
    OssService,
  ],
  exports: ['BROWSER_DRIVER', OssService],
})
export class ShareModule {}
