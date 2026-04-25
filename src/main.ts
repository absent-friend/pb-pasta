import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { PbPasta } from './app/pb-pasta';

bootstrapApplication(PbPasta, appConfig)
  .catch((err) => console.error(err));
