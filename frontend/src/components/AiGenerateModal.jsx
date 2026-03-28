import { useState } from "react";
import { Modal } from "./Modal";

const depthOptions = [
  { value: 1, label: "Level 1", description: "Very short outline" },
  { value: 2, label: "Level 2", description: "Short focused summary" },
  { value: 3, label: "Level 3 (Recommended)", description: "Balanced medium detail" }
];

export function AiGenerateModal({ onGenerate, onClose, isLoading }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    depth: 3
  });

  const submit = (event) => {
    event.preventDefault();
    onGenerate(form);
  };

  return (
    <Modal title="Generate Mind Map with Gemini" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        {isLoading ? (
          <div className="ai-loading-card">
            <div className="ai-loading-orbit" />
            <div>
              <strong>Generating your mind map</strong>
              <p>Organizing topics, branches, and revision details...</p>
            </div>
          </div>
        ) : null}

        <label className="field">
          <span>Topic Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Binary Search"
          />
        </label>

        <label className="field">
          <span>Topic Details</span>
          <textarea
            rows="7"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Explain the topic, scope, examples, formulas, and common mistakes."
          />
        </label>

        <label className="field">
          <span>Detail Level</span>
          <select
            value={form.depth}
            onChange={(event) => setForm((current) => ({ ...current, depth: Number(event.target.value) }))}
          >
            {depthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </label>

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Draft"}
        </button>
      </form>
    </Modal>
  );
}
