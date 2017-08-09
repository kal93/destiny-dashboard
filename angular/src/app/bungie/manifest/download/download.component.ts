import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { FileUtils } from 'app/shared/utilities/FileUtils';
import { IDestinyManifestMeta } from './download.interface';
import { environment } from '../../../../environments/environment';

declare var SQL: any;

// Not used by users. This is an admin help page to generate manifest things
@Component({
  selector: 'app-manifest',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadManifestComponent implements OnDestroy, OnInit {
  db: any;

  public tableMap = new Map<string, Array<any>>();

  constructor(protected http: HttpService, private sharedApp: SharedApp) {
    // "Lazy load" script so it's not part of the main bundle
    var script = document.createElement('script');
    script.src = "./sql.js";
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.db)
      this.db.close();
  }

  startProcess() {
    this.downloadNewMainfest().then((unzippedManifest: Uint8Array) => {
      this.reduceManifest(unzippedManifest);
    });
  }

  //Get new manifest from Bungie
  public downloadNewMainfest(): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      // Download manifest metadata, no cache
      this.http.getWithCache("https://www.bungie.net/d1/Platform/Destiny/Manifest/", HttpRequestType.BUNGIE_BASIC, 0).then((manifestMeta: IDestinyManifestMeta) => {
        var manifestFilename = manifestMeta.mobileWorldContentPaths.en.substr(manifestMeta.mobileWorldContentPaths.en.lastIndexOf("/") + 1);
        //Get the manifest .sqlite file
        this.http.httpGetBinary("https://www.bungie.net" + manifestMeta.mobileWorldContentPaths.en).then((sqlLiteZipBlob: Blob) => {
          FileUtils.blobToUintArray8(sqlLiteZipBlob).then((arrayBuffer: Uint8Array) => {
            FileUtils.unzipArrayBuffer(arrayBuffer, manifestFilename).then((unzippedManifest: Uint8Array) => {
              resolve(unzippedManifest);
            });
          });
        }).catch((error) => {
          reject(error);
        });
      });
    });
  }

  private reduceManifest(unzippedManifest: Uint8Array) {
    // Now we have database
    this.db = new SQL.Database(unzippedManifest);

    // Get all tables from the database meta data
    var resultSet = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);

    // resultSet[0] is the actual select data
    var tableDefinitions: Array<any> = resultSet[0];

    // Create a map per table
    this.tableMap = new Map<string, Array<any>>();

    // For every table definition in the meta data
    for (var i = 0; i < tableDefinitions.values.length; i++) {
      var tableName: string = tableDefinitions.values[i][0];

      // Tables that we want to ignore completely
      if (tableName == "DestinyActivityBundleDefinition" || tableName == "DestinyActivityCategoryDefinition" || tableName == "DestinyActivityDefinition" || tableName == "DestinyActivityModeDefinition"
        || tableName == "DestinyActivityTypeDefinition" || tableName == "DestinyBondDefinition" || tableName == "DestinyCombatantDefinition"
        || tableName == "DestinyDamageTypeDefinition" || tableName == "DestinyDestinationDefinition" || tableName == "DestinyDirectorBookDefinition" || tableName == "DestinyEnemyRaceDefinition"
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
      var tableRows = resultSet[0];

      // Create a map for the hash - > json values
      var rowMap = new Map<number, any>();

      // This is a unique hashId for most tables
      // Most tables follow the convention DestinyPlaceDefinition => placeHash. Others will be removed manually
      var tableHashId: string = (tableName.replace("Destiny", "").replace("Definition", "")).toLowerCase() + "Hash";

      tableRows.values.forEach((row) => {
        var hash = row[0];
        var rowObj = JSON.parse(row[1]);

        var originalHash = hash;

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
          delete rowObj.hasIcon; delete rowObj.secondaryIcon; delete rowObj.actionName; delete rowObj.hasAction; delete rowObj.deleteOnAction;
          delete rowObj.specialItemType; delete rowObj.equippingBlock; delete rowObj.hasGeometry; delete rowObj.statGroupHash; delete rowObj.instanced;
          delete rowObj.rewardItemHash; delete rowObj.values; delete rowObj.itemType; delete rowObj.itemSubType; delete rowObj.classType;
          delete rowObj.itemCategoryHashes; delete rowObj.sourceHashes; delete rowObj.values; delete rowObj.nonTransferrable; delete rowObj.exclusive; delete rowObj.maxStackSize;
          delete rowObj.itemIndex; delete rowObj.setItemHashes; delete rowObj.tooltipStyle; delete rowObj.needsFullCompletion; delete rowObj.objectiveHashes;
          delete rowObj.allowActions; delete rowObj.questTrackingUnlockValueHash; delete rowObj.bountyResetUnlockHash; delete rowObj.uniquenessHash;
          delete rowObj.showActiveNodesInTooltip; delete rowObj.hash; delete rowObj.index; delete rowObj.redacted;
        }

        rowMap.set(hash, rowObj);

      });

      this.tableMap.set(tableName, Array.from(rowMap.entries()));
    }

    var stringifiedDB = JSON.stringify(Array.from(this.tableMap.entries()));

    FileUtils.saveFile(stringifiedDB, "destiny-manifest_" + environment.version + ".json", "plain/text");
  }

}
