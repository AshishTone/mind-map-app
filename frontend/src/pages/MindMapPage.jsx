import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMap,
  deleteMap,
  fetchMap,
  fetchMaps,
  generateMap,
  saveMap
} from "../services/mapsApi";
import { useMindMapStore } from "../store/useMindMapStore";
import {
  addChildNode,
  annotateTree,
  deleteNodeFromTree,
  findNodeById,
  getActivePathIds,
  getMaxDepth,
  updateNodeInTree
} from "../hooks/useMindMapTree";
import { Toolbar } from "../components/Toolbar";
import { MindMapCanvas } from "../components/MindMapCanvas";
import { NodeDetailsPanel } from "../components/NodeDetailsPanel";
import { SavedMapsSidebar } from "../components/SavedMapsSidebar";
import { AiGenerateModal } from "../components/AiGenerateModal";
import { StepModeModal } from "../components/StepModeModal";

export function MindMapPage({ currentUser, onLogout }) {
  const queryClient = useQueryClient();
  const [draftMap, setDraftMap] = useState(null);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [orientation, setOrientation] = useState("vertical");
  const [freeViewEnabled, setFreeViewEnabled] = useState(false);
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const {
    selectedNodeId,
    searchTerm,
    stepModeEnabled,
    visibleDepth,
    setSelectedNodeId,
    setSearchTerm,
    toggleStepMode,
    closeStepMode,
    setVisibleDepth,
    resetStepMode
  } = useMindMapStore();

  const mapsQuery = useQuery({
    queryKey: ["maps", currentUser.id],
    queryFn: () => fetchMaps(currentUser.id)
  });

  const selectedMapQuery = useQuery({
    queryKey: ["map", selectedMapId, currentUser.id],
    queryFn: () => fetchMap({ mapId: selectedMapId, userId: currentUser.id }),
    enabled: Boolean(selectedMapId)
  });

  useEffect(() => {
    if (!selectedMapId && mapsQuery.data?.length) {
      setSelectedMapId(mapsQuery.data[0]._id);
    }
  }, [mapsQuery.data, selectedMapId]);

  useEffect(() => {
    if (selectedMapId) {
      setDraftMap(null);
    }
  }, [selectedMapId]);

  useEffect(() => {
    if (!selectedMapQuery.data) {
      return;
    }

    const prepared = {
      ...selectedMapQuery.data,
      rootNode: annotateTree(selectedMapQuery.data.rootNode)
    };

    setDraftMap(prepared);
    setSelectedNodeId(prepared.rootNode.id);
  }, [selectedMapQuery.data, setSelectedNodeId]);

  const createMapMutation = useMutation({
    mutationFn: createMap,
    onSuccess: async (createdMap) => {
      await queryClient.invalidateQueries({ queryKey: ["maps", currentUser.id] });
      setSelectedMapId(createdMap._id);
    }
  });

  const saveMutation = useMutation({
    mutationFn: saveMap,
    onSuccess: async (savedMap) => {
      setDraftMap({
        ...savedMap,
        rootNode: annotateTree(savedMap.rootNode)
      });
      await queryClient.invalidateQueries({ queryKey: ["maps", currentUser.id] });
      await queryClient.invalidateQueries({ queryKey: ["map", savedMap._id, currentUser.id] });
    }
  });

  const deleteMapMutation = useMutation({
    mutationFn: deleteMap,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["maps", currentUser.id] });
      if (selectedMapId === variables.mapId) {
        setSelectedMapId(null);
        setDraftMap(null);
      }
    }
  });

  const generateMutation = useMutation({
    mutationFn: generateMap,
    onSuccess: async (generatedMap, variables) => {
      createMapMutation.mutate(
        {
          userId: currentUser.id,
          username: currentUser.username,
          title: variables.title,
          description: generatedMap.description || variables.description,
          rootNode: {
            ...generatedMap.rootNode,
            title: variables.title || generatedMap.rootNode.title
          }
        },
        {
          onSuccess: async (createdMap) => {
            await queryClient.invalidateQueries({ queryKey: ["maps", currentUser.id] });
            setSelectedMapId(createdMap._id);
            setShowAiModal(false);
          }
        }
      );
    }
  });

  const selectedNode = useMemo(() => {
    if (!draftMap || !selectedNodeId) {
      return null;
    }

    return findNodeById(draftMap.rootNode, selectedNodeId);
  }, [draftMap, selectedNodeId]);

  const activePathIds = useMemo(() => {
    if (!draftMap) {
      return [];
    }

    return getActivePathIds(draftMap.rootNode, selectedNodeId);
  }, [draftMap, selectedNodeId]);

  const maxDepth = useMemo(() => getMaxDepth(draftMap?.rootNode), [draftMap]);
  const filteredMaps = useMemo(() => {
    const maps = mapsQuery.data || [];
    if (!mapSearchTerm.trim()) {
      return maps;
    }

    const query = mapSearchTerm.toLowerCase();
    return maps.filter((map) =>
      `${map.title} ${map.description || ""}`.toLowerCase().includes(query)
    );
  }, [mapsQuery.data, mapSearchTerm]);

  const updateMap = (updater) => {
    setDraftMap((current) => (current ? updater(current) : current));
  };

  const handleCreateMap = () => {
    createMapMutation.mutate({
      userId: currentUser.id,
      username: currentUser.username,
      title: `Untitled Map ${mapsQuery.data?.length ? mapsQuery.data.length + 1 : 1}`,
      description: ""
    });
  };

  const handleSave = () => {
    if (!draftMap) {
      return;
    }

    if (!draftMap._id) {
      createMapMutation.mutate(
        {
          userId: currentUser.id,
          username: currentUser.username,
          title: draftMap.title,
          description: draftMap.description,
          rootNode: draftMap.rootNode
        },
        {
          onSuccess: async (createdMap) => {
            await queryClient.invalidateQueries({ queryKey: ["maps", currentUser.id] });
            setSelectedMapId(createdMap._id);
          }
        }
      );
      return;
    }

    saveMutation.mutate(draftMap);
  };

  const handleNodeFieldChange = (field, value) => {
    if (!selectedNodeId) {
      return;
    }

    updateMap((current) => ({
      ...current,
      rootNode: updateNodeInTree(current.rootNode, selectedNodeId, (node) => ({
        ...node,
        [field]: value
      }))
    }));
  };

  const handleMapMetaChange = (field, value) => {
    updateMap((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleToggleCollapse = (nodeId) => {
    updateMap((current) => ({
      ...current,
      rootNode: updateNodeInTree(current.rootNode, nodeId, (node) => ({
        ...node,
        collapsed: !node.collapsed
      }))
    }));
  };

  const handleAddChild = () => {
    if (!selectedNodeId) {
      return;
    }

    updateMap((current) => ({
      ...current,
      rootNode: addChildNode(current.rootNode, selectedNodeId)
    }));
    setVisibleDepth(Math.max(visibleDepth, (selectedNode?.level ?? 0) + 1));
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId || !draftMap || selectedNodeId === draftMap.rootNode.id) {
      return;
    }

    const confirmed = window.confirm("Delete this node and its child nodes?");
    if (!confirmed) {
      return;
    }

    updateMap((current) => ({
      ...current,
      rootNode: deleteNodeFromTree(current.rootNode, selectedNodeId)
    }));
    setSelectedNodeId(draftMap.rootNode.id);
  };

  const handleDeleteMap = (mapId) => {
    const confirmed = window.confirm("Delete this saved mind map?");
    if (!confirmed) {
      return;
    }

    deleteMapMutation.mutate({ mapId, userId: currentUser.id });
  };

  const handleExport = () => {
    if (!draftMap) {
      return;
    }

    const safeTitle = (draftMap.title || "topic_title")
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "_");
    const blob = new Blob([JSON.stringify(draftMap, null, 2)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle || "topic_title"}.json.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasMap = Boolean(draftMap);

  return (
    <main className={`dashboard-shell ${stepModeEnabled ? "dashboard-shell-blurred" : ""}`}>
      <Toolbar
        username={currentUser.username}
        title={draftMap?.title}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewMap={handleCreateMap}
        onGenerate={() => setShowAiModal(true)}
        freeViewEnabled={freeViewEnabled}
        onToggleFreeView={() => setFreeViewEnabled((current) => !current)}
        onSave={handleSave}
        onToggleStepMode={toggleStepMode}
        onLogout={onLogout}
        isSaving={saveMutation.isPending || createMapMutation.isPending}
      />

      <div className="dashboard-grid">
        <SavedMapsSidebar
          maps={filteredMaps}
          selectedMapId={selectedMapId}
          mapSearchTerm={mapSearchTerm}
          onMapSearchChange={setMapSearchTerm}
          onSelect={setSelectedMapId}
          onCreate={handleCreateMap}
          onDelete={handleDeleteMap}
          onExport={(mapId) => {
            if (mapId === selectedMapId) {
              handleExport();
            }
          }}
        />

        <section className="editor-zone">
          {selectedMapQuery.isLoading && selectedMapId ? (
            <div className="screen-state">Loading map...</div>
          ) : null}

          {!hasMap && !selectedMapId ? (
            <div className="hero-empty-state">
              <p className="eyebrow">Start Here</p>
              <h2>Create a blank mind map or generate one with Gemini.</h2>
              <p>Each saved map is stored in MongoDB and appears in the sidebar for quick access.</p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={handleCreateMap}>
                  Create Blank Map
                </button>
                <button className="ghost-button" type="button" onClick={() => setShowAiModal(true)}>
                  Generate with AI
                </button>
              </div>
            </div>
          ) : null}

          {hasMap ? (
            <div className="workspace-grid">
              <MindMapCanvas
                title={draftMap.title}
                subtitle={orientation === "vertical" ? "Vertical Layout" : "Horizontal Layout"}
                node={draftMap.rootNode}
                selectedNodeId={selectedNodeId}
                activePathIds={activePathIds}
                searchTerm={searchTerm}
                visibleDepth={visibleDepth}
                stepModeEnabled={false}
                orientation={orientation}
                freeViewEnabled={freeViewEnabled}
                onToggleFreeView={() => setFreeViewEnabled((current) => !current)}
                allowHeaderActions
                onToggleOrientation={() =>
                  setOrientation((current) => (current === "vertical" ? "horizontal" : "vertical"))
                }
                onSelect={setSelectedNodeId}
                onToggleCollapse={handleToggleCollapse}
              />

              <NodeDetailsPanel
                node={selectedNode}
                mapTitle={draftMap.title}
                mapDescription={draftMap.description}
                onMapMetaChange={handleMapMetaChange}
                onNodeFieldChange={handleNodeFieldChange}
                onAddChild={handleAddChild}
                onDeleteNode={handleDeleteNode}
                canDeleteNode={selectedNodeId !== draftMap.rootNode.id}
              />
            </div>
          ) : null}
        </section>
      </div>

      {showAiModal ? (
        <AiGenerateModal
          onClose={() => setShowAiModal(false)}
          isLoading={generateMutation.isPending}
          onGenerate={(payload) => generateMutation.mutate(payload)}
        />
      ) : null}

      {stepModeEnabled && draftMap ? (
        <StepModeModal
          rootNode={draftMap.rootNode}
          selectedNodeId={selectedNodeId}
          activePathIds={activePathIds}
          searchTerm={searchTerm}
          visibleDepth={visibleDepth}
          maxDepth={maxDepth}
          orientation={orientation}
          freeViewEnabled={freeViewEnabled}
          onToggleFreeView={() => setFreeViewEnabled((current) => !current)}
          onToggleOrientation={() =>
            setOrientation((current) => (current === "vertical" ? "horizontal" : "vertical"))
          }
          onSelect={setSelectedNodeId}
          onToggleCollapse={handleToggleCollapse}
          onPrev={() => setVisibleDepth(Math.max(0, visibleDepth - 1))}
          onNext={() => setVisibleDepth(Math.min(maxDepth, visibleDepth + 1))}
          onReset={resetStepMode}
          onClose={closeStepMode}
        />
      ) : null}
    </main>
  );
}
