import { ExternalLink, Lightbulb, Link2, PieChart, Sparkles, X } from "lucide-react";
import { Button, IconButton } from "./ui";

export type AnalysisCount = {
  label: string;
  count: number;
};

export type GroupAnalysis = {
  groupTitle: string;
  itemCount: number;
  sourceBreakdown: AnalysisCount[];
  links: string[];
  typeCensus: AnalysisCount[];
  screenshotSources: string[];
  todos: string[];
  generatedAt: string;
};

function EmptyLine({ children }: { children: string }) {
  return <p className="rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-2 text-[12px] text-[#62666d]">{children}</p>;
}

export function AnalysisPanel({
  analysis,
  onClose,
}: {
  analysis: GroupAnalysis;
  onClose: () => void;
}) {
  return (
    <aside className="absolute bottom-4 right-4 top-4 z-[80] flex w-[320px] flex-col overflow-hidden rounded-lg border border-[#323334] bg-[#0f1011] text-[#f7f8f8] shadow-[rgba(0,0,0,0.55)_0px_18px_60px_0px]">
      <header className="flex items-start gap-3 border-b border-[#23252a] bg-[#161718] px-4 py-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#3d431f] bg-[#e4f222] text-[#08090a]">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{analysis.groupTitle}</p>
          <p className="mt-0.5 text-[11px] text-[#8a8f98]">{analysis.itemCount} items analyzed</p>
        </div>
        <IconButton label="Close analysis" onClick={onClose} className="shrink-0">
          <X size={14} />
        </IconButton>
      </header>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        <section>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]">
            <PieChart size={14} className="text-[#e4f222]" /> Type census
          </div>
          <div className="grid grid-cols-2 gap-2">
            {analysis.typeCensus.map((item) => (
              <div key={item.label} className="rounded-md border border-[#23252a] bg-[#161718] px-3 py-2">
                <p className="text-[16px] font-semibold">{item.count}</p>
                <p className="text-[11px] capitalize text-[#8a8f98]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]">
            <ExternalLink size={14} className="text-[#e4f222]" /> Sources
          </div>
          {analysis.sourceBreakdown.length ? (
            <div className="space-y-2">
              {analysis.sourceBreakdown.map((source) => (
                <div key={source.label} className="flex items-center justify-between rounded-md border border-[#23252a] bg-[#161718] px-3 py-2 text-[12px]">
                  <span className="min-w-0 truncate text-[#d0d6e0]">{source.label}</span>
                  <span className="ml-3 rounded-full bg-[#383b3f] px-2 py-0.5 text-[10px] font-semibold text-[#f7f8f8]">{source.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine>No source metadata yet.</EmptyLine>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]">
            <Link2 size={14} className="text-[#e4f222]" /> Links
          </div>
          {analysis.links.length ? (
            <div className="space-y-2">
              {analysis.links.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate rounded-md border border-[#23252a] bg-[#161718] px-3 py-2 text-[12px] text-[#8fb4ff] hover:border-[#3d4b7d]"
                >
                  {link}
                </a>
              ))}
            </div>
          ) : (
            <EmptyLine>No links found in this group.</EmptyLine>
          )}
        </section>

        {analysis.screenshotSources.length ? (
          <section>
            <div className="mb-2 text-[12px] font-semibold text-[#d0d6e0]">Screenshot provenance</div>
            <div className="space-y-2">
              {analysis.screenshotSources.map((source) => (
                <p key={source} className="rounded-md border border-[#23252a] bg-[#161718] px-3 py-2 text-[12px] text-[#d0d6e0]">
                  {source}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]">
            <Lightbulb size={14} className="text-[#e4f222]" /> Suggested next steps
          </div>
          <div className="space-y-2">
            {analysis.todos.map((todo) => (
              <p key={todo} className="rounded-md border border-[#2d3122] bg-[#1b1d12] px-3 py-2 text-[12px] leading-5 text-[#e9efb1]">
                {todo}
              </p>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-[#23252a] bg-[#161718] px-4 py-3">
        <Button variant="secondary" onClick={onClose} className="w-full">
          Done
        </Button>
      </footer>
    </aside>
  );
}
