import { TreeView } from "@/components/tree-view";
import {
  buildAssetTree,
  buildLocationTree,
  createLocationsMap,
  getAssets,
  getLocations,
} from "@/lib/data";

export default async function Company(props: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await props.params;
  const locations = await getLocations(companyId);
  const assets = await getAssets(companyId);

  const locationsMap = createLocationsMap(locations);
  const assetsTree = buildAssetTree(assets, locationsMap);
  const locationsTree = buildLocationTree(locationsMap);

  const treeData = [...locationsTree, ...assetsTree];

  return (
    <div className="flex flex-col h-full p-4">
      <TreeView treeData={treeData} />
    </div>
  );
}
