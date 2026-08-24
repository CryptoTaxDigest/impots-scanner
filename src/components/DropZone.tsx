import { useRef, useState, type DragEvent } from "react";

const ACCEPT = ".json,.zip,application/json,application/zip";

export function DropZone({
  onFile,
  loading,
}: {
  onFile: (file: File) => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`dropzone${dragOver ? " dropzone--active" : ""}${loading ? " dropzone--loading" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-busy={loading}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {loading ? (
        <p>Analyse en cours…</p>
      ) : (
        <>
          <p className="dropzone__title">Importez un export impots.gouv</p>
          <p className="dropzone__hint">
            Fichier <code>.json</code> DPR ou archive <code>.zip</code> — analyse 100&nbsp;% locale
          </p>
          <button type="button" className="btn btn--secondary" onClick={(e) => e.stopPropagation()}>
            Choisir un fichier
          </button>
        </>
      )}
    </div>
  );
}
