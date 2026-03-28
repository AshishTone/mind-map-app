import { Modal } from "./Modal";
import { MindMapCanvas } from "./MindMapCanvas";
import { StepModeControls } from "./StepModeControls";

export function StepModeModal({
  rootNode,
  selectedNodeId,
  activePathIds,
  searchTerm,
  visibleDepth,
  maxDepth,
  orientation,
  freeViewEnabled,
  onToggleFreeView,
  onToggleOrientation,
  onSelect,
  onToggleCollapse,
  onPrev,
  onNext,
  onReset,
  onClose
}) {
  return (
    <Modal title="Step Mode" onClose={onClose} wide>
      <MindMapCanvas
        title="Presentation View"
        subtitle="Step Mode"
        node={rootNode}
        selectedNodeId={selectedNodeId}
        activePathIds={activePathIds}
        searchTerm={searchTerm}
        visibleDepth={visibleDepth}
        stepModeEnabled
        orientation={orientation}
        freeViewEnabled={freeViewEnabled}
        onToggleFreeView={onToggleFreeView}
        allowHeaderActions
        onToggleOrientation={onToggleOrientation}
        onSelect={onSelect}
        onToggleCollapse={onToggleCollapse}
      />
      <StepModeControls
        visibleDepth={visibleDepth}
        maxDepth={maxDepth}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
        onClose={onClose}
      />
    </Modal>
  );
}
