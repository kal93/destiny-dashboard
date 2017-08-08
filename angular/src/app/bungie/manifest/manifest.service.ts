import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../../shared/services/http.service';
import { SharedApp } from '../../shared/services/shared-app.service';
import { SharedBungie } from '../shared-bungie.service';
import { environment } from '../../../environments/environment';

import { FileUtils } from '../../shared/utilities/FileUtils';

declare var SQL: any;

/** This Injectable manages the data layer for Destiny Character Stats*/
@Injectable()
export class ManifestService {
    //                  Map<tableName, Map<hash, object>>
    private manifestMap: Map<string, Map<number, any>>;

    constructor(protected http: HttpService, private sharedApp: SharedApp) {
    }

    public getManifestEntry(table: string, hash: number) {
        var tableMap = this.manifestMap.get(table);
        return tableMap == null ? null : tableMap.get(hash);
    }

    public getTableMap(table: string) {
        return this.manifestMap.get(table);
    }

    public loadManifest(): Promise<any> {
        var loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);
        return new Promise((resolve, reject) => {
            //Download latest local manifest zip file
            this.http.httpGetBinary("./destiny-manifest_0.1.73.zip").then((manifestZipBlob: Blob) => {
                //Convert it a workable format for unzipping
                FileUtils.blobToUintArray8(manifestZipBlob).then((arrayBuffer: Uint8Array) => {
                    //Unzip it
                    FileUtils.unzipArrayBuffer(arrayBuffer, "destiny-manifest_0.1.73.json").then((unzippedManifest: Uint8Array) => {
                        //Convert bytearray to JSON string
                        var stringifiedDB = FileUtils.utf8ByteArrayToString(unzippedManifest);

                        //Parse JSON string
                        var manifestData = JSON.parse(stringifiedDB);

                        //Cleanup
                        stringifiedDB = null;

                        //Convert array of data in to ES6 map for quick lookups
                        this.manifestMap = new Map<string, Map<number, any>>();
                        manifestData.forEach((manifestEntry) => {
                            var tableName: string = manifestEntry[0];
                            var rows: Array<any> = manifestEntry[1];

                            var tableMap = new Map<number, any>();

                            rows.forEach((row) => {
                                tableMap.set(row[0], row[1]);
                            });

                            this.manifestMap.set(tableName, tableMap);
                        });

                        //Cleanup
                        manifestData = null;

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
} 