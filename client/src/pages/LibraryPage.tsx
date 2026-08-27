/*
 * Feature module: local catalog + real PDF ingestion.
 * PDFs are uploaded as bytes to the server, stored in S3, parsed server-side,
 * and returned as durable document metadata for the signed-in teacher.
 */
import { useMemo, useRef, useState } from "react";
import { BookOpen, Check, Download, FileText, Loader2, Search, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { books } from "@/data/catalog";
import { useAppStore } from "@/contexts/AppStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function LibraryPage() {
  const auth = useAuth();
  const { downloadedBookIds, downloadBook } = useAppStore();
  const [query, setQuery] = useState("");
  const [uploadingName, setUploadingName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const documentsQuery = trpc.documents.list.useQuery(undefined, { enabled: auth.isAuthenticated });
  const uploadMutation = trpc.documents.upload.useMutation({ onSuccess: () => documentsQuery.refetch() });
  const filteredBooks = useMemo(() => books.filter((book) => `${book.title} ${book.subject} ${book.meta}`.toLowerCase().includes(query.toLowerCase())), [query]);

  async function uploadPdf(file?: File) {
    if (!file) return;
    if (!auth.isAuthenticated) { startLogin(); return; }
    if (file.type !== "application/pdf") { toast.error("Choose a PDF file"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("PDF must be 50MB or smaller"); return; }
    setUploadingName(file.name);
    try {
      const dataBase64 = await readAsDataUrl(file);
      await uploadMutation.mutateAsync({ filename: file.name, mimeType: "application/pdf", dataBase64 });
      toast.success("PDF added to your library", { description: "Text has been extracted and is ready to preview." });
    } catch (error) {
      toast.error("Could not parse that PDF", { description: "Try a text-based PDF under 50MB." });
    } finally {
      setUploadingName("");
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return <AppShell><main className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="section-eyebrow">Feature / 03 · Offline library</div><h1 className="font-display text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">Carry the<br /><span className="text-[#e45d32]">classroom.</span></h1><p className="mt-7 max-w-[480px] text-[16px] leading-7 text-[#566055]">Choose local books when you need certainty, then add your own real PDFs for a library that reflects the classroom.</p></div><div className="flex w-full max-w-[420px] flex-col gap-3"><label htmlFor="book-search" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">Search local + cloud catalog</label><div className="flex items-center gap-3 rounded-full border border-[#20251f]/15 bg-white px-4 py-3"><Search size={17} className="text-[#6b746a]" /><input id="book-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “math” or “class 2”" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a6aaa2]" /></div><input ref={fileInput} type="file" accept="application/pdf" className="hidden" onChange={(event) => uploadPdf(event.target.files?.[0])} /><button onClick={() => auth.isAuthenticated ? fileInput.current?.click() : startLogin()} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2d6b4a]">{uploadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {uploadingName ? `Parsing ${uploadingName}` : auth.isAuthenticated ? "Upload a real PDF" : "Sign in to upload PDFs"}</button></div></div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{filteredBooks.map((book, index) => { const downloaded = downloadedBookIds.includes(book.id); return <article key={book.id} className="group overflow-hidden rounded-[24px] border border-[#20251f]/10 bg-white shadow-[0_12px_35px_rgba(32,37,31,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(32,37,31,0.1)]"><div className={`relative h-48 overflow-hidden p-5 ${index % 3 === 0 ? "bg-[#e8ded0]" : index % 3 === 1 ? "bg-[#dcebdc]" : "bg-[#313d63]"}`}><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#20251f_1px,transparent_1px),linear-gradient(90deg,#20251f_1px,transparent_1px)] [background-size:20px_20px]" /><div className={`relative flex h-full flex-col justify-between rounded-xl border p-4 ${index % 3 === 2 ? "border-white/20 text-white" : "border-[#20251f]/15 text-[#20251f]"}`}><div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.12em]"><span>Field file / {String(book.id + 1).padStart(2, "0")}</span><BookOpen size={15} /></div><div className="font-display text-4xl">{index % 3 === 1 ? "अ" : index % 3 === 2 ? "01—08" : "∑"}</div></div></div><div className="p-5"><div className="font-display text-2xl">{book.title}</div><div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#9a9f97]">{book.meta} · {book.size}</div><div className="mt-6 flex items-center justify-between"><span className={`flex items-center gap-2 text-xs font-semibold ${downloaded ? "text-[#2d6b4a]" : "text-[#6b746a]"}`}>{downloaded ? <><span className="grid size-5 place-items-center rounded-full bg-[#e8f1e5]"><Check size={12} /></span> Available offline</> : "Cloud library"}</span><button onClick={() => { downloadBook(book.id); toast.success(downloaded ? "Already saved offline" : "Textbook saved for offline use", { description: book.title }); }} className="grid size-9 place-items-center rounded-full border border-[#20251f]/15 hover:border-[#e45d32] hover:bg-[#fff0e7] hover:text-[#e45d32]" aria-label={`Download ${book.title}`}>{downloaded ? <Check size={15} /> : <Download size={15} />}</button></div></div></article>; })}</div>{filteredBooks.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-[#20251f]/20 p-10 text-center text-[#6b746a]">No local matches yet. Try a broader phrase.</div>}<section className="mt-14"><div className="mb-5 flex items-end justify-between gap-4"><div><div className="section-eyebrow">Your uploaded documents</div><h2 className="font-display text-4xl">The teacher shelf.</h2></div><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b746a]">{documentsQuery.data?.length ?? 0} parsed files</span></div>{!auth.isAuthenticated ? <div className="rounded-[24px] border border-dashed border-[#20251f]/20 bg-[#fffaf3] p-8 text-center"><UserRound className="mx-auto text-[#e45d32]" size={22} /><p className="mt-3 text-sm text-[#6b746a]">Sign in to see and upload your personal PDFs.</p></div> : documentsQuery.isLoading ? <div className="rounded-[24px] border border-[#20251f]/10 bg-white p-8 text-[#6b746a]">Loading your parsed documents…</div> : documentsQuery.data?.length ? <div className="grid gap-4 lg:grid-cols-2">{documentsQuery.data.map((doc) => <article key={doc.id} className="ruled-surface rounded-[22px] border border-[#20251f]/10 bg-white p-5"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#fff0e7] text-[#e45d32]"><FileText size={18} /></div><div><div className="font-display text-2xl">{doc.filename}</div><div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]">{doc.pageCount} pages · parsed {new Date(doc.createdAt).toLocaleDateString()}</div></div></div><a href={doc.fileUrl} target="_blank" rel="noreferrer" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#2d6b4a] hover:text-[#e45d32]">Open PDF</a></div><p className="mt-5 max-h-28 overflow-hidden whitespace-pre-wrap border-t border-[#20251f]/10 pt-4 text-sm leading-6 text-[#566055]">{doc.extractedText || "No text layer found. The original PDF is still available above."}</p></article>)}</div> : <div className="rounded-[24px] border border-dashed border-[#20251f]/20 bg-[#fffaf3] p-8 text-center text-sm text-[#6b746a]">Upload a classroom PDF to create your first parsed field file.</div>}</section></main></AppShell>;
}
