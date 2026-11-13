import { useRef, useState } from "react";
import { Download, Upload, Save, FolderOpen, Trash2 } from "lucide-react";
import { SAVE_SLOT_IDS, deleteSlot, exportEnvelope, importEnvelope, listSlots, readSlot, writeSlot, type SaveSlotId } from "../../lib/saveSlots";
import { loadSlotIntoGame, saveCurrentToSlot } from "../../lib/saveSlotActions";

const NAME: Record<SaveSlotId, string> = { autosave: "Autosave", "slot-1": "Slot 1", "slot-2": "Slot 2", "slot-3": "Slot 3" };

/** Autosave + three backup slots for the active profile, with JSON export/import. */
export default function SaveBackupPanel() {
  const [slots, setSlots] = useState(listSlots);
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const importTarget = useRef<SaveSlotId>("slot-1");
  const refresh = () => setSlots(listSlots());

  const exportSlot = (id: SaveSlotId) => {
    const env = readSlot(id);
    if (!env) return;
    const url = URL.createObjectURL(new Blob([exportEnvelope(env)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `kai-jax-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const env = importEnvelope(await file.text(), importTarget.current);
    if (env && writeSlot(env)) setNote(`Imported into ${NAME[importTarget.current]}.`);
    else setNote("That file is not a valid Kai-Jax save.");
    if (fileRef.current) fileRef.current.value = "";
    refresh();
  };

  const btn = "flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/15 disabled:opacity-35";

  return (
    <section className="z-10 mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6" data-testid="save-backup-panel" aria-label="Backup slots">
      <h2 className="text-sm font-black uppercase tracking-[0.25em] text-amber-300">Backup Slots</h2>
      <p className="mb-3 mt-1 text-[11px] text-slate-400">Copies of the current profile. Loading one replaces the current profile&apos;s progress and unlocked heroes.</p>
      <ul className="space-y-2">
        {SAVE_SLOT_IDS.map((id) => {
          const env = slots[id];
          return (
            <li key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 p-3" data-testid={`backup-${id}`}>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-widest text-white">{NAME[id]}</div>
                <div className="truncate text-[10px] font-mono text-slate-400">
                  {env ? `${env.label} · ${new Date(env.savedAt).toLocaleString()}` : "Empty"}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {id !== "autosave" ? (
                  <button type="button" className={btn} data-testid={`backup-save-${id}`} onClick={() => { setNote(saveCurrentToSlot(id) ? `Saved to ${NAME[id]}.` : "Could not write save (storage full or blocked)."); refresh(); }}>
                    <Save className="h-3 w-3" />Save
                  </button>
                ) : null}
                <button type="button" className={btn} disabled={!env} data-testid={`backup-load-${id}`} onClick={() => setNote(loadSlotIntoGame(id) ? `Loaded ${NAME[id]}.` : "Nothing to load.")}>
                  <FolderOpen className="h-3 w-3" />Load
                </button>
                <button type="button" className={btn} disabled={!env} onClick={() => exportSlot(id)} aria-label={`Export ${NAME[id]}`}>
                  <Download className="h-3 w-3" />Export
                </button>
                {id !== "autosave" ? (
                  <button type="button" className={btn} onClick={() => { importTarget.current = id; fileRef.current?.click(); }} aria-label={`Import into ${NAME[id]}`}>
                    <Upload className="h-3 w-3" />Import
                  </button>
                ) : null}
                <button type="button" className={btn} disabled={!env} onClick={() => { deleteSlot(id); refresh(); }} aria-label={`Delete ${NAME[id]}`}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      <p className="mt-2 min-h-[1rem] text-[11px] text-cyan-300" role="status" data-testid="backup-note">{note}</p>
    </section>
  );
}
