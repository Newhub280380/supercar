"use client";

import * as React from "react";
import {
  Heart,
  Sparkles,
  Scissors,
  Droplets,
  Leaf,
  Calendar,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProcedureCard } from "@/components/domain/procedure-card";
import { ClientBadge } from "@/components/domain/client-badge";
import { AppointmentSlot } from "@/components/domain/appointment-slot";

function ColorSwatch({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`size-12 rounded-xl border border-border/60 ${className}`} />
      <span className="text-[0.65rem] text-muted-foreground">{label}</span>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-heading font-semibold">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export function ThemeShowcase() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-center gap-6 text-center animate-fade-in">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-gold" />
          <span>Design System</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl md:text-6xl">
          Beauty meets{" "}
          <span className="text-gradient-rose">Intelligence</span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          A cosmetology-themed design system with pastel tones, elegant
          typography, and domain-specific components. Toggle{" "}
          <span className="font-medium text-foreground">light/dark</span> themes
          using the button above.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">
            <Sparkles className="mr-1.5 size-4" /> Get Started
          </Button>
          <Button size="lg" variant="outline">
            Explore
          </Button>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Color Palette"
          subtitle="Soft pastels for a professional beauty aesthetic"
        />
        <div className="flex flex-wrap gap-4">
          <ColorSwatch label="Primary (Rose)" className="bg-primary" />
          <ColorSwatch label="Accent (Blush)" className="bg-accent" />
          <ColorSwatch label="Gold" className="bg-gold" />
          <ColorSwatch label="Cream" className="bg-cream" />
          <ColorSwatch label="Sage" className="bg-sage" />
          <ColorSwatch label="Blush" className="bg-blush" />
          <ColorSwatch label="Muted" className="bg-muted" />
          <ColorSwatch label="Border" className="bg-border" />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Typography"
          subtitle="Fraunces serif for headings, Geist sans for body"
        />
        <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-6">
          <p className="text-3xl font-bold font-heading">Display Heading</p>
          <p className="text-2xl font-semibold font-heading">Section Title</p>
          <p className="text-lg font-medium font-heading">Subheading</p>
          <p className="text-base font-heading">
            Body text — Geist provides clean readability for long-form content.
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            Monospace — Geist Mono for code and technical labels
          </p>
          <p className="text-sm text-gradient-rose font-heading font-medium">
            Gradient text for emphasis and branding
          </p>
        </div>
      </section>

      <section>
        <SectionHeader title="Base Components" subtitle="shadcn/ui with cosmetology theme" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="icon"><Heart className="size-3.5" /></Button>
              </div>
              <Button variant="destructive" size="sm">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge>
                <Star className="size-3" /> Featured
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Search services..." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button size="sm" />}>
                  Open Dialog
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                      Confirm your appointment for the selected service.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Appointment confirmed for June 20, 2026 at 10:00 AM.
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setDialogOpen(false)}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar size="sm">
                <AvatarImage src="" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="" alt="User" />
                <AvatarFallback>ML</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Glass Effect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl glass-card p-4 text-sm text-muted-foreground">
                Frosted-glass card effect with backdrop blur and subtle borders.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Domain Components"
          subtitle="Cosmetology-specific UI building blocks"
        />

        <div className="flex flex-wrap gap-3">
          <ClientBadge clientName="Anna Kim" status="vip" skinType="dry" />
          <ClientBadge clientName="Maria Lopez" status="returning" skinType="oily" />
          <ClientBadge clientName="Jane Doe" status="new" skinType="sensitive" size="sm" />
          <ClientBadge clientName="Lee Park" status="vip" skinType="combination" size="sm" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProcedureCard
            name="Hyaluronic Filler"
            description="Non-surgical treatment to restore facial volume and smooth fine lines."
            price="$350"
            duration={45}
            category="Fillers"
            featured
          />
          <ProcedureCard
            name="Chemical Peel"
            description="Professional-grade peel to exfoliate skin and reveal a brighter complexion."
            price="$180"
            duration={30}
            category="Peels"
          />
          <ProcedureCard
            name="Hydrafacial"
            imageUrl=""
            price="$220"
            duration={60}
            category="Skincare"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <AppointmentSlot
            time="09:00"
            serviceName="Hydrafacial Deep Clean"
            clientName="Anna K."
            duration={60}
            status="confirmed"
            date="Jun 20, 2026"
          />
          <AppointmentSlot
            time="10:30"
            serviceName="Lip Filler Touch-up"
            clientName="Maria L."
            duration={30}
            status="pending"
            date="Jun 20, 2026"
          />
          <AppointmentSlot
            time="12:00"
            serviceName="Chemical Peel"
            clientName="Jane D."
            duration={45}
            status="completed"
            date="Jun 20, 2026"
          />
          <AppointmentSlot
            time="13:30"
            serviceName="Botox Consultation"
            clientName="Lee P."
            duration={20}
            status="cancelled"
            date="Jun 20, 2026"
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Iconography" subtitle="Lucide React icons" />
        <div className="flex flex-wrap gap-4 rounded-xl border border-border/50 bg-card/50 p-6">
          {[Heart, Sparkles, Scissors, Droplets, Leaf, Calendar, Star].map(
            (Icon) => (
              <div
                key={Icon.displayName}
                className="flex size-10 items-center justify-center rounded-lg border border-border/50 text-primary transition-colors hover:bg-muted"
              >
                <Icon className="size-5" />
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
