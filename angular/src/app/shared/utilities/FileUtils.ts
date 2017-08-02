declare var JSZip: any;
declare var TextDecoder: any;

export class FileUtils {
    public static saveFile(data, filename: string, type: string): void {
        var file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a");
            var url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    public static unzipArrayBuffer(arrayBuffer: Uint8Array, manifestFilename: string): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            //Unzip the manifest
            JSZip.loadAsync(arrayBuffer).then((unzippedResult) => {
                //Find the entry in the newly uncompressed zip file
                var unzippedManifestEntry = unzippedResult.files[manifestFilename];
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
        var zip = new JSZip();
        zip.file(manifestFilename, arrayBuffer);
        return null;
    }

    public static blobToUintArray8(blob: Blob): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            var fileReader = new FileReader();
            fileReader.onload = (result) => {
                var arrayBuffer = fileReader.result;
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
        var out = [], pos = 0, c = 0;
        while (pos < bytes.length) {
            var c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            } else if (c1 > 191 && c1 < 224) {
                var c2 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
            } else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                var c4 = bytes[pos++];
                var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
                out[c++] = String.fromCharCode(0xD800 + (u >> 10));
                out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
            } else {
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            }
        }
        return out.join('');
    }


}