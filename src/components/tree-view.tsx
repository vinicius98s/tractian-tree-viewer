"use client";

import { memo, useMemo, useState } from "react";
import Image from "next/image";

import { Asset, Location, TreeNode } from "@/lib/data";

import asset from "../../public/asset.png";
import location from "../../public/location.png";
import component from "../../public/component.png";

type Props = {
  treeData: TreeNode[];
};

const getIcon = (node: TreeNode) => {
  if ((node as Asset).sensorType) {
    return <Image src={component} alt="Component icon" />;
  }

  if (!(node as Location).parentId) {
    return <Image src={location} alt="Location icon" />;
  }

  return <Image src={asset} alt="Asset icon" />;
};

const hasChildrenCriticalSensor = (nodes?: TreeNode[]): boolean => {
  if (nodes?.length) {
    for (const node of nodes) {
      if ("status" in node && node.status === "alert") {
        return true;
      }

      if (node.children && hasChildrenCriticalSensor(node.children)) {
        return true;
      }
    }
  }

  return false;
};

const hasChildrenEnergySensor = (nodes?: TreeNode[]): boolean => {
  if (nodes?.length) {
    for (const node of nodes) {
      if ((node as Asset).sensorType === "energy") {
        return true;
      }

      if (node.children) {
        return hasChildrenEnergySensor(node.children);
      }
    }
  }

  return false;
};

const TreeNodeComponent = memo(function TreeNode(props: {
  node: TreeNode;
  search: string;
  filterEnergySensors: boolean;
  showCriticalSensors: boolean;
}) {
  const icon = getIcon(props.node);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 hover:bg-blue-100 cursor-pointer py-1 pl-2">
        <div className="w-5">{icon}</div>
        {props.node.name}
        {"status" in props.node ? (
          <div
            className={`size-2 rounded-full ${props.node.status === "alert" ? "bg-red-500" : "bg-green-500"}`}
          />
        ) : null}
      </div>

      <div className="pl-4">
        {props.node.children?.map((node) =>
          renderNode(
            node,
            props.search,
            props.filterEnergySensors,
            props.showCriticalSensors,
          ),
        )}
      </div>
    </div>
  );
});

const renderNode = (
  node: TreeNode,
  search: string,
  filterEnergySensors: boolean,
  showCriticalSensors: boolean,
) => {
  let shouldRender = true;

  if (filterEnergySensors && !hasChildrenEnergySensor(node.children)) {
    shouldRender = (node as Asset).sensorType === "energy";
  }

  if (showCriticalSensors) {
    if (node.children?.length) {
      shouldRender = hasChildrenCriticalSensor(node.children);
    } else {
      shouldRender = (node as Asset).status === "alert";
    }
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <TreeNodeComponent
      key={node.id}
      node={node}
      search={search}
      showCriticalSensors={showCriticalSensors}
      filterEnergySensors={filterEnergySensors}
    />
  );
};

function searchTreeNodes(nodes: TreeNode[], search: string): TreeNode[] {
  const lowerSearch = search.toLowerCase();
  return nodes
    .map((node) => {
      const filteredChildren = node.children
        ? searchTreeNodes(node.children, search)
        : [];

      const matches = node.name.toLowerCase().includes(lowerSearch);
      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter(Boolean) as TreeNode[];
}

export function TreeView(props: Props) {
  const [search, setSearch] = useState("");
  const [filterEnergySensors, setFilterEnergySensors] = useState(false);
  const [showCriticalSensors, setShowCriticalSensors] = useState(false);

  const filteredTreeData = useMemo(() => {
    if (search) {
      return searchTreeNodes(props.treeData, search);
    }
    return props.treeData;
  }, [props.treeData, search]);

  return (
    <>
      <div className="flex justify-between mb-4">
        <div>
          <span className="font-bold">Ativos</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setFilterEnergySensors((prev) => !prev);
              setShowCriticalSensors(false);
            }}
            className={`border-2 border-slate-200 px-4 py-2 ${filterEnergySensors ? "bg-[#2188FF] text-white" : "bg-white"}`}
          >
            Sensor de Energia
          </button>
          <button
            onClick={() => {
              setShowCriticalSensors((prev) => !prev);
              setFilterEnergySensors(false);
            }}
            className={`border-2 border-slate-200 px-4 py-2 ${showCriticalSensors ? "bg-[#2188FF] text-white" : "bg-white"}`}
          >
            Crítico
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="flex-[0.5] mr-2">
          <div className="flex flex-col items-start">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar Ativo ou Local"
              className="w-full border-2 border-slate-200 p-2 focus:outline-slate-400 mb-2"
            />

            <div className="flex flex-col items-start w-full overflow-y-scroll h-[calc(100vh-14rem)]">
              {filteredTreeData.map((node) =>
                renderNode(
                  node,
                  search,
                  filterEnergySensors,
                  showCriticalSensors,
                ),
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 border-2 border-slate-200"></div>
      </div>
    </>
  );
}
