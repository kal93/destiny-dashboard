import { Component } from '@angular/core';
import { FileUtils } from 'app/shared/utilities/FileUtils';
import { IDestinyManifestMeta } from './download-manifest.interface';
import { ManifestService } from './manifest.service';
import { environment } from '../../../environments/environment';

// Not used by users. This is an admin help page to generate manifest things
@Component({
  selector: 'app-manifest',
  template: `<div class="dd-manifest">
              <md-card class="card">
                <md-card-header> <md-card-title class="title">Download Manifest</md-card-title> </md-card-header>
                <md-card-content class="content">
                  <p> <button md-raised-button (click)="downloadManifestDatabase()">Download Manifest SQLite DB</button> </p>
                </md-card-content>
              </md-card>
            </div>`,
  styleUrls: ['./download-manifest.component.scss']
})
export class DownloadManifestComponent {

  constructor(protected manifestService: ManifestService) {
  }

  ngOnDestroy() {
  }

  downloadManifestDatabase() {
    this.manifestService.getManifestMetadata().then((manifestMeta: IDestinyManifestMeta) => {
      let manifestFilename = manifestMeta.mobileWorldContentPaths.en.substr(manifestMeta.mobileWorldContentPaths.en.lastIndexOf("/") + 1);
      this.manifestService.getManifestDatabase(manifestMeta).then((sqlLiteZipBlob: Blob) => {
        FileUtils.blobToUintArray8(sqlLiteZipBlob).then((arrayBuffer: Uint8Array) => {
          FileUtils.unzipArrayBuffer(arrayBuffer, manifestFilename).then((unzippedManifest: Uint8Array) => {
            FileUtils.saveFile(unzippedManifest, manifestFilename + ".sqlite", "plain/text");
          });
        });
      });
    });
  }
}