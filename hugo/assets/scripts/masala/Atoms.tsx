import React, { useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  BackgroundVariant,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  applyNodeChanges,
} from "@xyflow/react";
import { Entity } from "./masala-model-tools";
import Mobile from './devices/Mobile';

let hashmap = new Map<string, Node>();
let initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  { id: "3", position: { x: 0, y: 100 }, data: { label: "2" }, type: 'mobileNode', },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];
const nodeTypes = {
  mobileNode: Mobile,
};

interface AtomsProps {
  entities?: Entity[];
}

export default function Atoms(props: AtomsProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { entities = [] } = props;

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  React.useEffect(() => {
    const entityEdges: Edge[] = [];
    const updatedNodes: Node[] = entities.map((entity, index): Node => {
      const newNode: Node = {
        id: entity.name,
        position: { x: 0, y: index * 100 },
        data: { label: entity.name },
      };
      if (entity.superType) {
        entityEdges.push({
          id: `${entity.name}-${entity.superType.ref.name}`,
          source: entity.name,
          target: entity.superType.ref.name,
        });
      }

      const existingNode = hashmap.get(entity.name);
      if (existingNode) {
        const newNodeWithPosition = {
          ...newNode,
          position: existingNode.position,
        };
        hashmap.set(entity.name, newNodeWithPosition);
        // console.error(
        //   ` $$$$ ${entity.name} position = ${JSON.stringify(
        //     newNodeWithPosition.position,
        //     null,
        //     2
        //   )}`
        // );
        return newNodeWithPosition;
      }
      hashmap.set(entity.name, newNode);
      return newNode;
    });
    // setNodes(updatedNodes);
    setEdges(entityEdges);
    // console.error(`$$$$ Entities Changed ${entities.length}`);
    // console.error(` $$$$ HashMap = ${JSON.stringify(hashmap, null, 2)}`);
    // console.error(` $$$$ ENtities = ${JSON.stringify(updatedNodes, null, 2)}`);
    // console.error(` $$$$ Edges = ${JSON.stringify(entityEdges, null, 2)}`);
  }, [entities]);
  

  const onNodePositionChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNode = changes[0] as Node;
      if (updatedNode.type && updatedNode.type == "position" && updatedNode.dragging == false) {
        // console.error(` $$$$ changes = ${JSON.stringify(updatedNode, null, 2)}`);
        hashmap.set(updatedNode.id, updatedNode);
      }
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    [setNodes],
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodePositionChange}
        // onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
