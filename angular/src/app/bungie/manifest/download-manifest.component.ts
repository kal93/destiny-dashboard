import { Component } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { FileUtils } from 'app/shared/utilities/FileUtils';
import { IDestinyManifestMeta } from './download-manifest.interface';
import { ManifestService } from './manifest.service';
import { environment } from '../../../environments/environment';

declare let SQL: any;

// Not used by users. This is an admin help page to generate manifest things
@Component({
  selector: 'app-manifest',
  templateUrl: './download-manifest.component.html',
  styleUrls: ['./download-manifest.component.scss']
})
export class DownloadManifestComponent {
  db: any;

  public tableMap = new Map<string, Array<any>>();

  constructor(protected http: HttpService, protected manifestService: ManifestService, private sharedApp: SharedApp) {
    // "Lazy load" script so it's not part of the main bundle
    let script = document.createElement('script');
    script.src = "./sql.js";
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  ngOnDestroy() {
    if (this.db)
      this.db.close();
  }

  downloadManifestJson() {
    this.manifestService.getManifestMetadata().then((manifestMeta: IDestinyManifestMeta) => {
      let manifestFilename = manifestMeta.mobileWorldContentPaths.en.substr(manifestMeta.mobileWorldContentPaths.en.lastIndexOf("/") + 1);
      this.manifestService.getManifestDatabase(manifestMeta).then((sqlLiteZipBlob: Blob) => {
        FileUtils.blobToUintArray8(sqlLiteZipBlob).then((arrayBuffer: Uint8Array) => {
          FileUtils.unzipArrayBuffer(arrayBuffer, manifestFilename).then((unzippedManifest: Uint8Array) => {
            let reducedManifest = this.reduceManifest(unzippedManifest);
            FileUtils.saveFile(reducedManifest, "destiny-manifest_" + environment.version + ".json", "plain/text");
          });
        });

      });
    });
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

  private reduceManifest(unzippedManifest: Uint8Array): string {
    // Now we have database
    this.db = new SQL.Database(unzippedManifest);

    // Get all tables from the database meta data
    let resultSet = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);

    // resultSet[0] is the actual select data
    let tableDefinitions: Array<any> = resultSet[0];

    // Create a map per table
    this.tableMap = new Map<string, Array<any>>();

    // For every table definition in the meta data
    for (let i = 0; i < tableDefinitions.values.length; i++) {
      let tableName: string = tableDefinitions.values[i][0];

      // Tables that we want to ignore completely
      if (tableName == "DestinyActivityBundleDefinition" || tableName == "DestinyActivityCategoryDefinition" || tableName == "DestinyActivityModeDefinition"
        || tableName == "DestinyActivityTypeDefinition" || tableName == "DestinyBondDefinition" || tableName == "DestinyCombatantDefinition"
        || tableName == "DestinyDestinationDefinition" || tableName == "DestinyDirectorBookDefinition" || tableName == "DestinyEnemyRaceDefinition"
        || tableName == "DestinyGrimoireCardDefinition" || tableName == "DestinyGrimoireDefinition"
        || tableName == "DestinyHistoricalStatsDefinition" || tableName == "DestinyItemCategoryDefinition"
        || tableName == "DestinyLocationDefinition" || tableName == "DestinyMedalTierDefinition" || tableName == "DestinyObjectiveDefinition" || tableName == "DestinyPlaceDefinition"
        || tableName == "DestinyRecordBookDefinition" || tableName == "DestinyRecordDefinition"
        || tableName == "DestinyRewardSourceDefinition" || tableName == "DestinySandboxPerkDefinition" || tableName == "DestinyScriptedSkullDefinition" || tableName == "DestinySpecialEventDefinition"
        || tableName == "DestinyStatDefinition" || tableName == "DestinyStatGroupDefinition" || tableName == "DestinyTalentGridDefinition" || tableName == "DestinyTriumphSetDefinition"
        || tableName == "DestinyUnlockFlagDefinition" || tableName == "DestinyVendorCategoryDefinition" || tableName == "DestinyVendorDefinition") {
        resultSet = this.db.exec(`DROP TABLE ${tableName}`);
        continue;
      }

      resultSet = this.db.exec(`SELECT * FROM ${tableName}`);
      let tableRows = resultSet[0];

      // Create a map for the hash - > json values
      let rowMap = new Map<number, any>();

      // This is a unique hashId for most tables
      // Most tables follow the convention DestinyPlaceDefinition => placeHash. Others will be removed manually
      let tableHashId: string = (tableName.replace("Destiny", "").replace("Definition", "")).toLowerCase() + "Hash";

      tableRows.values.forEach((row) => {
        let hash = row[0];
        let rowObj = JSON.parse(row[1]);

        let originalHash = hash;

        // If the hash is negative, 0xFFFFFFF bitwise it because that's how it comes from Bungie
        if (hash < 0) hash += 4294967296

        // Delete tableHashId since we already have it
        delete rowObj[tableHashId];

        // Delete other unnecessary fields
        delete rowObj.hash;

        //DetinyInventoryItemDefinition
        delete rowObj.itemHash;

        // DestinyClassDefinition
        delete rowObj.classNameFemale;
        delete rowObj.classNameMale;

        // DestinyRaceDefinition
        delete rowObj.raceNameFemale;
        delete rowObj.raceNameMale;

        // DestinyGenderDefinition
        delete rowObj.genderDescription;

        // Delete certain fields that we don't care about
        if (tableName == "DestinyInventoryItemDefinition") {

          delete rowObj.hasIcon; delete rowObj.secondaryIcon; delete rowObj.hasGeometry;
          delete rowObj.actionName; delete rowObj.hasAction; delete rowObj.deleteOnAction;
          delete rowObj.specialItemType; delete rowObj.equippingBlock; delete rowObj.instanced;
          delete rowObj.rewardItemHash; delete rowObj.values;
          delete rowObj.values; delete rowObj.exclusive;
          delete rowObj.itemIndex; delete rowObj.setItemHashes; delete rowObj.tooltipStyle; delete rowObj.needsFullCompletion;
          delete rowObj.allowActions; delete rowObj.uniquenessHash;
          delete rowObj.showActiveNodesInTooltip; delete rowObj.index; delete rowObj.redacted; delete rowObj.bountyResetUnlockHash;
          delete rowObj.itemCategoryHashes;
        }

        rowMap.set(hash, rowObj);

      });

      this.tableMap.set(tableName, Array.from(rowMap.entries()));
    }

    let stringifiedDB = JSON.stringify(Array.from(this.tableMap.entries()));

    return stringifiedDB;
  }

}



// WEBPACK FOOTER //
// C:/destiny/destiny-dashboard/angular/src/app/bungie/manifest/download-manifest.component.ts