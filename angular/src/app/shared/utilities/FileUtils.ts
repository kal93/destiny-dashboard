declare let JSZip: any;
declare let TextDecoder: any;

export class FileUtils {
    public static saveFile(data, filename: string, type: string): void {
        let file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            let a = document.createElement("a");
            let url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }

    public static unzipArrayBuffer(arrayBuffer: Uint8Array, manifestFilename: string): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            //Unzip the manifest
            JSZip.loadAsync(arrayBuffer).then((unzippedResult) => {
                //Find the entry in the newly uncompressed zip file
                let unzippedManifestEntry = unzippedResult.files[manifestFilename];
                if (unzippedManifestEntry == null)
                    return reject("unzippedManifestEntry was null.");
                //Extract the zip file as a uint8array
                unzippedManifestEntry.async('uint8array').then((unzippedManifest) => {
                    resolve(unzippedManifest);
                }).catch((error) => {
                    reject(error);
                });
            });
        });
    }

    public static zipArrayBuffer(arrayBuffer: Uint8Array, manifestFilename: string): Promise<Uint8Array> {
        let zip = new JSZip();
        zip.file(manifestFilename, arrayBuffer);
        return null;
    }

    public static blobToUintArray8(blob: Blob): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = (result) => {
                let arrayBuffer = fileReader.result;
                resolve(new Uint8Array(arrayBuffer));
            };

            fileReader.onerror = (error) => {
                reject(error);
            };

            fileReader.readAsArrayBuffer(blob);
        });
    }

    public static utf8ByteArrayToString = (bytes: Uint8Array) => {
        if (window.hasOwnProperty("TextDecoder"))
            return new TextDecoder("utf-8").decode(bytes);
        let out = [], pos = 0, c = 0;
        while (pos < bytes.length) {
            let c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            } else if (c1 > 191 && c1 < 224) {
                let c2 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
            } else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                let c2 = bytes[pos++];
                let c3 = bytes[pos++];
                let c4 = bytes[pos++];
                let u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
                out[c++] = String.fromCharCode(0xD800 + (u >> 10));
                out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
            } else {
                let c2 = bytes[pos++];
                let c3 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            }
        }
        return out.join('');
    }


}