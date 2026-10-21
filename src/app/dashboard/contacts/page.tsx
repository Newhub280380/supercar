"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookUser, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABELS,
  type ContactStatus,
} from "@/lib/crm/contacts";

type Contact = {
  id: string;
  name: string;
  specialty: string | null;
  city: string | null;
  clinic: string | null;
  source: string | null;
  phones: string | null;
  whatsapp: string | null;
  instagram: string | null;
  status: ContactStatus;
};

type ContactForm = {
  name: string;
  specialty: string;
  city: string;
  clinic: string;
  source: string;
  phones: string;
  whatsapp: string;
  instagram: string;
  status: ContactStatus;
};

const EMPTY_FORM: ContactForm = {
  name: "",
  specialty: "",
  city: "",
  clinic: "",
  source: "",
  phones: "",
  whatsapp: "",
  instagram: "",
  status: "new",
};

function toForm(contact: Contact): ContactForm {
  return {
    name: contact.name,
    specialty: contact.specialty ?? "",
    city: contact.city ?? "",
    clinic: contact.clinic ?? "",
    source: contact.source ?? "",
    phones: contact.phones ?? "",
    whatsapp: contact.whatsapp ?? "",
    instagram: contact.instagram ?? "",
    status: contact.status,
  };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [importNote, setImportNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Не удалось загрузить контакты");
        setContacts([]);
      } else {
        setContacts(data.contacts ?? []);
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => contacts, [contacts]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setForm(toForm(contact));
    setFormError(null);
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(
        editing ? `/api/contacts/${editing.id}` : "/api/contacts",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setFormError(data?.error ?? "Не удалось сохранить");
        return;
      }
      setDialogOpen(false);
      await load();
    } catch {
      setFormError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (contact: Contact) => {
    if (!confirm(`Удалить контакт «${contact.name}»?`)) return;
    const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось удалить");
      return;
    }
    await load();
  };

  const importFile = async (file: File) => {
    setImportNote(null);
    setError(null);
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/contacts/import", { method: "POST", body });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Импорт не удался");
      return;
    }
    const problems = (data.errors ?? []) as Array<{ row: number; message: string }>;
    const detail = problems
      .slice(0, 5)
      .map((issue) => `строка ${issue.row}: ${issue.message}`)
      .join("; ");
    setImportNote(
      `Создано ${data.created}, обновлено ${data.updated}` +
        (problems.length ? `. Ошибки (${problems.length}): ${detail}` : ""),
    );
    await load();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Контакты</h1>
          <p className="text-muted-foreground text-sm">
            Врачи и клиники: имя, специальность, город, клиника, источник,
            телефоны, WhatsApp, Instagram, статус
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void importFile(file);
              }}
            />
            <span className="border-border hover:bg-muted inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium">
              <Upload className="size-4" />
              Импорт CSV
            </span>
          </label>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Новый контакт
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по имени, клинике, городу, телефону"
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border-border bg-background h-8 rounded-lg border px-2 text-sm"
        >
          <option value="all">Все статусы</option>
          {CONTACT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CONTACT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <Badge variant="secondary">{visible.length}</Badge>
      </div>

      {importNote && <p className="mb-3 text-sm">{importNote}</p>}
      {error && <p className="text-destructive mb-3 text-sm">{error}</p>}
      {loading && <p className="text-muted-foreground text-sm">Загрузка…</p>}

      {!loading && visible.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-sm">
            <BookUser className="size-6" />
            Контактов пока нет. Добавьте карточку или импортируйте CSV.
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        {visible.length > 0 && (
          <table className="w-full min-w-[880px] text-sm">
            <thead className="text-muted-foreground text-left text-xs">
              <tr>
                <th className="px-2 py-2 font-medium">Имя</th>
                <th className="px-2 py-2 font-medium">Специальность</th>
                <th className="px-2 py-2 font-medium">Город</th>
                <th className="px-2 py-2 font-medium">Клиника</th>
                <th className="px-2 py-2 font-medium">Источник</th>
                <th className="px-2 py-2 font-medium">Телефоны</th>
                <th className="px-2 py-2 font-medium">WhatsApp</th>
                <th className="px-2 py-2 font-medium">Instagram</th>
                <th className="px-2 py-2 font-medium">Статус</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((contact) => (
                <tr key={contact.id} className="border-border border-t">
                  <td className="px-2 py-2 font-medium">{contact.name}</td>
                  <td className="px-2 py-2">{contact.specialty || "—"}</td>
                  <td className="px-2 py-2">{contact.city || "—"}</td>
                  <td className="px-2 py-2">{contact.clinic || "—"}</td>
                  <td className="px-2 py-2">{contact.source || "—"}</td>
                  <td className="px-2 py-2">{contact.phones || "—"}</td>
                  <td className="px-2 py-2">{contact.whatsapp || "—"}</td>
                  <td className="px-2 py-2">{contact.instagram || "—"}</td>
                  <td className="px-2 py-2">
                    <Badge variant="outline">
                      {CONTACT_STATUS_LABELS[contact.status] ?? contact.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(contact)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void remove(contact)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Редактировать контакт" : "Новый контакт"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Имя" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Field
              label="Специальность"
              value={form.specialty}
              onChange={(specialty) => setForm({ ...form, specialty })}
            />
            <Field label="Город" value={form.city} onChange={(city) => setForm({ ...form, city })} />
            <Field
              label="Клиника"
              value={form.clinic}
              onChange={(clinic) => setForm({ ...form, clinic })}
            />
            <Field
              label="Источник"
              value={form.source}
              onChange={(source) => setForm({ ...form, source })}
            />
            <Field
              label="Телефоны"
              value={form.phones}
              onChange={(phones) => setForm({ ...form, phones })}
            />
            <Field
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(whatsapp) => setForm({ ...form, whatsapp })}
            />
            <Field
              label="Instagram"
              value={form.instagram}
              onChange={(instagram) => setForm({ ...form, instagram })}
            />
            <label className="flex flex-col gap-1 text-sm">
              Статус
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as ContactStatus })
                }
                className="border-border bg-background h-8 rounded-lg border px-2"
              >
                {CONTACT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {CONTACT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {formError && <p className="text-destructive text-sm">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button disabled={saving || !form.name.trim()} onClick={() => void save()}>
              {saving ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
