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
    //                  Map<tableName, Map<hash, object>>
    private manifestMap: Map<string, Map<number, any>>;

    // Tower definition from the manifest so we can have the icon
    public vaultIconPath: string;

    constructor(protected http: HttpService, private sharedApp: SharedApp) {
    }

    public getManifestEntry(table: string, hash: number) {
        let tableMap = this.manifestMap.get(table);
        return tableMap == null ? null : tableMap.get(hash);
    }

    public getTableMap(table: string) {
        return this.manifestMap.get(table);
    }

    public loadManifest(): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);
        return new Promise((resolve, reject) => {
            //Download latest local manifest zip file
            this.http.httpGetBinary("./destiny-manifest_1.2.6.zip").then((manifestZipBlob: Blob) => {
                //Convert it a workable format for unzipping
                FileUtils.blobToUintArray8(manifestZipBlob).then((arrayBuffer: Uint8Array) => {
                    //Unzip it
                    FileUtils.unzipArrayBuffer(arrayBuffer, "destiny-manifest_1.2.6.json").then((unzippedManifest: Uint8Array) => {
                        //Convert bytearray to JSON string
                        let stringifiedDB = FileUtils.utf8ByteArrayToString(unzippedManifest);

                        //Parse JSON string
                        let manifestData = JSON.parse(stringifiedDB);

                        //Cleanup
                        stringifiedDB = null;

                        //Convert array of data in to ES6 map for quick lookups
                        this.manifestMap = new Map<string, Map<number, any>>();
                        manifestData.forEach((manifestEntry) => {
                            let tableName: string = manifestEntry[0];
                            let rows: Array<any> = manifestEntry[1];

                            let tableMap = new Map<number, any>();

                            rows.forEach((row) => {
                                tableMap.set(row[0], row[1]);
                            });

                            this.manifestMap.set(tableName, tableMap);
                        });

                        //Cleanup
                        manifestData = null;

                        this.setGlobalManifestDefinitions();

                        this.sharedApp.hideLoading(loadingId);
                        resolve();
                    });
                });
            }).catch((error) => {
                this.sharedApp.showError("Could not load manifest!", error);
                this.sharedApp.hideLoading(loadingId);
                reject(error);
            });
        });
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