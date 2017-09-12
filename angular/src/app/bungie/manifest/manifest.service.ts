import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { environment } from '../../../environments/environment';

import { FileUtils } from '../../shared/utilities/FileUtils';
import { IDestinyManifestMeta } from './download-manifest.interface';

declare let SQL: any;

/** This Injectable manages the data layer for Destiny Character Stats*/
@Injectable()
export class ManifestService {
    db: any;

    //                  Map<tableName, Map<hash, object>>
    private manifestMap = new Map<string, Map<number, any>>();

    // Tower definition from the manifest so we can have the icon
    vaultIconPath: string;

    constructor(protected http: HttpService, private sharedApp: SharedApp) {
        // "Lazy load" script so it's not part of the main bundle since this file will never change
        let script = document.createElement('script');
        script.src = "./sql.js";
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    getManifestEntry(tableName: string, hash: number) {
        // Try to get the table data
        let start = Date.now();
        let tableMap = this.getTableMap(tableName);
        if (tableMap != null) {
            return tableMap.get(hash);
        }
    }

    getTableMap(tableName: string) {
        let start = Date.now();
        let tableMap = this.manifestMap.get(tableName);

        if (tableMap == null)
            tableMap = this.loadTableFromManifest(tableName);

        this.manifestMap.set(tableName, tableMap);

        return tableMap;
    }

    downloadManifest(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // Get manifest meta from Bungie
            this.getManifestMetadata().then((manifestMeta: IDestinyManifestMeta) => {
                let manifestFilename = manifestMeta.mobileWorldContentPaths.en.substr(manifestMeta.mobileWorldContentPaths.en.lastIndexOf("/") + 1);

                // Download manifest db from Bunge
                this.getManifestDatabase(manifestMeta).then((sqlLiteZipBlob: Blob) => {

                    // Convert .sql file to array buffer
                    FileUtils.blobToUintArray8(sqlLiteZipBlob).then((arrayBuffer: Uint8Array) => {

                        // Unzip array buffer
                        FileUtils.unzipArrayBuffer(arrayBuffer, manifestFilename).then((unzippedManifest: Uint8Array) => {

                            // Load manifest database
                            var start = Date.now();
                            this.db = new SQL.Database(unzippedManifest);
                            this.setGlobalManifestDefinitions();

                            resolve();
                        });
                    });
                });
            });
        });
    }

    public loadTableFromManifest(tableName: string): Map<number, any> {

        /*  // Tables that we want to ignore completely
        if (tableName == "DestinyActivityBundleDefinition") {resultSet = this.db.exec(`DROP TABLE ${tableName}`);
          continue;   } */
        let resultSet = this.db.exec('SELECT * FROM ' + tableName);
        let tableRows = resultSet[0];
        if (tableRows == null)
            return null;

        // Create a map for the hash - > json values
        let rowMap = new Map<number, any>();

        // Loop table and store row as json object
        for (let j = 0; j < tableRows.values.length; j++) {
            let row = tableRows.values[j];

            let hash = row[0];
            let rowObj = JSON.parse(row[1]);

            if (rowObj.redacted == true) continue;

            // If the hash is negative, add 0xFFFFFFF (because that's how it comes from Bungie)
            if (hash < 0) hash += 4294967296

            rowMap.set(hash, rowObj);
        }

        return rowMap;
    }

    private setGlobalManifestDefinitions() {
        try { this.vaultIconPath = this.getManifestEntry("DestinyVendorDefinition", 1037843411).displayProperties.icon; }
        catch (e) { }
    }

    getManifestMetadata(): Promise<IDestinyManifestMeta> {
        return this.http.getWithCache("https://www.bungie.net/Platform/Destiny2/Manifest/", HttpRequestType.BUNGIE_BASIC, 0);
    }

    getManifestDatabase(manifestMeta: IDestinyManifestMeta): Promise<Blob> {
        return this.http.httpGetBinary("https://www.bungie.net" + manifestMeta.mobileWorldContentPaths.en);
    }
}