export interface IDestinyManifestMeta {
    version: string;
    mobileAssetContentPath: string;
    mobileGearAssetDataBases: MobileGearAssetDataBasis[];
    mobileWorldContentPaths: MobileWorldContentPaths;
    mobileGearCDN: MobileGearCDN;
}

interface MobileGearCDN {
    Geometry: string;
    Texture: string;
    PlateRegion: string;
    Gear: string;
    Shader: string;
}

interface MobileWorldContentPaths {
    en: string;
    fr: string;
    es: string;
    de: string;
    it: string;
    ja: string;
    'pt-br': string;
}

interface MobileGearAssetDataBasis {
    version: number;
    path: string;
}