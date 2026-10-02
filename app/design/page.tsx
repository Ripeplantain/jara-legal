// Temporary design-token preview for Phase 0b review. Remove before launch
// (see prompts/v1-build.md). Not linked from anywhere.
import {
  ArrowUpIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  LoaderCircleIcon,
  ReceiptIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";

export const metadata = { title: "Design tokens · jara-legal", robots: { index: false } };

const semantic = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["muted", "bg-muted"],
  ["secondary", "bg-secondary"],
  ["accent", "bg-accent"],
  ["primary", "bg-primary"],
  ["highlight", "bg-highlight"],
  ["border", "bg-border"],
  ["input", "bg-input"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["info", "bg-info"],
  ["destructive", "bg-destructive"],
] as const;

const scales = {
  teal: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
  saffron: ["50", "100", "200", "300", "400", "500", "600", "700"],
  stone: ["0", "25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Board({ mode }: { mode: "light" | "dark" }) {
  return (
    <div className={`${mode} bg-background text-foreground min-w-0 flex-1 space-y-10 p-8`}>
      <header className="space-y-1">
        <p className="font-display text-title">
          jara<span className="text-highlight">.</span>
          <span className="text-muted-foreground">legal</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Design tokens v0.1 · {mode} · provisional wordmark
        </p>
      </header>

      <Section title="Semantic colors">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {semantic.map(([name, cls]) => (
            <div key={name} className="space-y-1">
              <div className={`${cls} h-10 rounded-md ring-1 ring-foreground/10`} />
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Palette">
        {Object.entries(scales).map(([hue, steps]) => (
          <div key={hue} className="flex overflow-hidden rounded-md ring-1 ring-foreground/10">
            {steps.map((step) => (
              <div
                key={step}
                className="h-8 flex-1"
                style={{ background: `var(--${hue}-${step})` }}
                title={`${hue}-${step}`}
              />
            ))}
          </div>
        ))}
      </Section>

      <Section title="Type">
        <div className="space-y-2">
          <p className="font-display text-display">Your NDA, in a few questions.</p>
          <p className="font-display text-title">Mutual NDA — Acme Ltd</p>
          <p className="font-display text-section">Confidentiality terms</p>
          <p className="text-lg font-semibold">Invoice INV-0042</p>
          <p className="text-base">
            Who&apos;s sharing confidential information — you, the client, or both?
          </p>
          <p className="text-sm text-muted-foreground">Last edited 2 minutes ago</p>
          <p className="font-mono text-sm tabular-nums">USD 1,250.00 · VAT 15.00% · INV-0042</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Confirm and generate</Button>
          <Button variant="secondary">Edit details</Button>
          <Button variant="outline">New chat</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete chat</Button>
          <Button variant="link">View template note</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button disabled>
            <LoaderCircleIcon className="animate-spin" /> Generating…
          </Button>
          <Button size="icon" aria-label="Send">
            <ArrowUpIcon />
          </Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-client`}>Client name</Label>
            <Input id={`${mode}-client`} placeholder="Acme Ltd" />
            <p className="text-xs text-muted-foreground">As it should appear on the document.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-tax`}>Tax rate (%)</Label>
            <Input id={`${mode}-tax`} defaultValue="fifteen" aria-invalid />
            <p className="text-xs text-destructive">Enter a number, e.g. 15.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-due`}>Due date</Label>
            <Input id={`${mode}-due`} disabled defaultValue="Set after confirm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-scope`}>Project scope</Label>
            <Textarea id={`${mode}-scope`} placeholder="Redesign of the customer portal" />
          </div>
        </div>
      </Section>

      <Section title="Status badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="warning">Needs info</Badge>
          <Badge variant="info">Ready to confirm</Badge>
          <Badge variant="success">
            <CheckIcon /> Generated
          </Badge>
          <Badge variant="warning">
            <TriangleAlertIcon /> Placeholder legal text
          </Badge>
          <Badge variant="highlight">New</Badge>
          <Badge variant="destructive">Failed</Badge>
        </div>
      </Section>

      <Section title="Chat">
        <div className="space-y-4 rounded-xl bg-muted/50 p-4">
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-md bg-bubble-user px-4 py-2.5 text-base text-bubble-user-foreground">
              I need an NDA for Acme Ltd before we start the portal project.
            </p>
          </div>
          <p className="max-w-[85%] text-base">
            Got it. Is this one-way (only you share confidential information) or mutual
            (both sides share)? And how long should confidentiality last?
          </p>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Check the details</CardTitle>
              <CardDescription>Mutual NDA · nothing is generated until you confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Parties</dt>
                <dd>Ada Studio ↔ Acme Ltd</dd>
                <dt className="text-muted-foreground">Scope</dt>
                <dd>Customer portal redesign</dd>
                <dt className="text-muted-foreground">Term</dt>
                <dd>2 years</dd>
              </dl>
            </CardContent>
            <CardFooter className="gap-2 border-t pt-(--card-spacing) pb-(--card-spacing)">
              <Button>Confirm and generate</Button>
              <Button variant="ghost">Change something</Button>
            </CardFooter>
          </Card>

          <div className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 ring-foreground/10">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <FileTextIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Mutual NDA — Acme Ltd.pdf</p>
              <p className="text-xs text-muted-foreground">Generated just now · template, not legal advice</p>
            </div>
            <Button variant="outline" size="sm">
              <DownloadIcon /> Download
            </Button>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 ring-foreground/10">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-subtle text-warning">
              <ReceiptIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Invoice INV-0042 — Acme Ltd</p>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">USD 1,437.50 · due 30 Oct</p>
            </div>
            <Badge variant="success">Generated</Badge>
          </div>

          <div className="flex items-end gap-2 rounded-2xl bg-card p-2 shadow-md ring-1 ring-foreground/10">
            <Textarea
              aria-label="Message"
              placeholder="Describe the NDA or invoice you need…"
              className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <Button size="icon" aria-label="Send">
              <ArrowUpIcon />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Radius & shadow">
        <div className="flex flex-wrap gap-4">
          {(["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg"] as const).map((s, i) => (
            <div
              key={s}
              className={`${s} ${["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"][i]} flex size-20 items-center justify-center bg-card text-xs text-muted-foreground`}
            >
              {s.replace("shadow-", "")}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default function DesignPage() {
  return (
    <main className="flex flex-1 flex-col xl:flex-row">
      <Board mode="light" />
      <Board mode="dark" />
    </main>
  );
}
