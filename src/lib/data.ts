const BASE_URL = "https://fake-api.tractian.com";

type Company = {
  id: string;
  name: string;
};

export async function getCompanies() {
  const response = await fetch(`${BASE_URL}/companies`);
  const companies = (await response.json()) as Company[];
  return companies;
}

export type Location = {
  id: string;
  name: string;
  parentId: string | null;
  children?: TreeNode[];
};

export async function getLocations(companyId: string) {
  const response = await fetch(`${BASE_URL}/companies/${companyId}/locations`);
  const locations = (await response.json()) as Location[];
  return locations;
}

export type Asset = {
  id: string;
  name: string;
  sensorId: string;
  locationId: string | null;
  gatewayId: string | null;
  parentId: string | null;
  sensorType: string | null;
  status: string | null;
  children?: TreeNode[];
};

export type TreeNode = Location | Asset;

export async function getAssets(companyId: string) {
  const response = await fetch(`${BASE_URL}/companies/${companyId}/assets`);
  const assets = await response.json();
  return assets as Asset[];
}

export const createLocationsMap = (
  locations: Location[],
): Record<string, Location> => {
  const locationMap: Record<string, Location> = {};
  for (const location of locations) {
    locationMap[location.id] = { ...location, children: [] };
  }
  return locationMap;
};

export const buildAssetTree = (
  assets: Asset[],
  locationMap: Record<string, Location>,
): Asset[] => {
  const assetMap = new Map<string, Asset>();
  const rootAssets: Asset[] = [];

  for (const asset of assets) {
    assetMap.set(asset.id, { ...asset, children: [] });
  }

  for (const asset of assets) {
    const { locationId, parentId } = asset;
    const currentAsset = assetMap.get(asset.id)!;

    if (locationId && locationMap[locationId]) {
      (locationMap[locationId].children ??= []).push(currentAsset);
    } else if (parentId && assetMap.has(parentId)) {
      const parentAsset = assetMap.get(parentId)!;
      (parentAsset.children ??= []).push(currentAsset);
    } else {
      rootAssets.push(currentAsset);
    }
  }

  return rootAssets;
};

export const buildLocationTree = (
  locationMap: Record<string, Location>,
): Location[] => {
  const locationTree: Location[] = [];

  for (const location of Object.values(locationMap)) {
    if (!location.parentId) {
      locationTree.push(location);
    } else {
      const parentLocation = locationMap[location.parentId];
      if (parentLocation) {
        if (!parentLocation.children) {
          parentLocation.children = [];
        }
        parentLocation.children.push(location);
      } else {
        locationTree.push(location);
      }
    }
  }

  return locationTree;
};
