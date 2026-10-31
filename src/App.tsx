import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type OnConnect,
  OnConnectEnd,
  ReactFlowProvider,
  Panel,
  NodeMouseHandler,
  Node
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
  },
];
let id = 1;
const getId = () => `${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

function AddNodeOnEdgeDrop () {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editLabel, setEditLabel] = useState('');
  const [edittingId, setEdittingId] = useState<string | null>(null);
  const { screenToFlowPosition, updateNodeData } = useReactFlow();
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    []
  );
  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          type: 'default',
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };
 
        setNodes((nds) => nds.concat(newNode));
        const newEdge: any = { id, source: connectionState.fromNode?.id, target: id }
        setEdges((eds) =>
          eds.concat(newEdge),
        );
      }
    },
    [screenToFlowPosition],
  );
  const onNodeDoubleClick: NodeMouseHandler<Node> = useCallback((event, node) => {
    event.preventDefault();
    setEdittingId(node.id);
    const nodeLabel = typeof node.data.label === 'string' ? node.data.label : '';
    setEditLabel(nodeLabel);
  }, [setEdittingId, setEditLabel]);
  const onSaveEdit = useCallback(() => {
    if (edittingId) {
      updateNodeData(edittingId, { label: editLabel });
      setEdittingId(null);
      setEditLabel('');
    }
  }, [edittingId, editLabel, setNodes]);

  return (
    <div className="wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
        colorMode="dark"
      >
        <Panel hidden={edittingId === null} position="top-left" style={{ width: 200 }}>
        <label className="xy-theme__label">Label: </label>
        <input
          value={editLabel}
          onChange={(evt) => setEditLabel(evt.target.value)}
          className="xy-theme__input"
        />
        button
        <button
          type="submit"
          onClick={(onSaveEdit)}
        >
          Update Label
        </button>
      </Panel>
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);