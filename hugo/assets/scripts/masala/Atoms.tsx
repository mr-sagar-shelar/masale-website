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
} from "@xyflow/react";
import { Entity } from "./masala-model-tools";

let initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

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
        entityEdges.push(
          { id: `${entity.name}-${entity.superType.ref.name}`, source: entity.name, target: entity.superType.ref.name }
        )
      }
      return newNode;
    });
    setNodes(updatedNodes);
    setEdges(entityEdges);
    // console.error(` $$$$ ENtities = ${JSON.stringify(updatedNodes, null, 2)}`);
    // console.error(` $$$$ Edges = ${JSON.stringify(entityEdges, null, 2)}`);
  }, [entities]);


  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
