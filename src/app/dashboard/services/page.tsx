"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Sparkles,
  Clock,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  servicesData as initialServices,
  SERVICE_CATEGORIES,
} from "@/lib/mock-data";
import { exportServicesCsv } from "@/lib/csv-export";
import type { ServiceItem } from "@/lib/mock-data";

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  isActive: boolean;
}

const EMPTY_FORM: ServiceFormData = {
  name: "",
  description: "",
  price: "",
  duration: "60",
  category: "",
  isActive: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  const filteredServices = useMemo(() => {
    let result = services;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (activeFilter !== "all") {
      result = result.filter((s) =>
        activeFilter === "active" ? s.isActive : !s.isActive,
      );
    }
    return result;
  }, [services, search, categoryFilter, activeFilter]);

  const totalRevenue = services.reduce((sum, s) => {
    const price = parseInt(s.price.replace(/[^\d]/g, ""));
    return sum + (isNaN(price) ? 0 : price * s.appointmentsCount);
  }, 0);

  const openAddDialog = () => {
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: String(service.duration),
      category: service.category,
      isActive: service.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: formData.name,
                description: formData.description || null,
                price: formData.price,
                duration: parseInt(formData.duration) || 60,
                category: formData.category,
                isActive: formData.isActive,
              }
            : s,
        ),
      );
    } else {
      const newService: ServiceItem = {
        id: `srv-${Date.now()}`,
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        duration: parseInt(formData.duration) || 60,
        category: formData.category,
        imageUrl: null,
        isActive: formData.isActive,
        appointmentsCount: 0,
      };
      setServices((prev) => [newService, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const toggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const handleExport = () => {
    const data = filteredServices.map((s) => ({
      "Название": s.name,
      "Описание": s.description || "",
      "Цена": s.price,
      "Длительность (мин)": s.duration,
      "Категория": s.category,
      "Активна": s.isActive ? "Да" : "Нет",
      "Кол-во записей": s.appointmentsCount,
    }));
    exportServicesCsv(data, "services");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Услуги</h1>
          <p className="text-sm text-muted-foreground">
            {services.length} услуг · Доход: ₽{totalRevenue.toLocaleString("ru-RU")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            Экспорт
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="size-4" />
            Новая услуга
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-2 pt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск услуг..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="all">Все категории</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  activeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {{ all: "Все", active: "Активные", inactive: "Неактивные" }[f]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => openEditDialog(service)}
            onDelete={() => setDeleteTarget(service)}
            onToggle={() => toggleActive(service.id)}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-3">
              <Sparkles className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Услуги не найдены</p>
            <p className="text-xs text-muted-foreground">Измените фильтры или добавьте новую услугу</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Обновите данные услуги." : "Заполните данные новой услуги."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Field label="Название">
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Например: Биоревитализация"
              />
            </Field>

            <Field label="Описание">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                placeholder="Краткое описание услуги..."
                className="w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Цена (₽)">
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  placeholder="12,000"
                />
              </Field>
              <Field label="Длительность (мин)">
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="60"
                />
              </Field>
            </div>

            <Field label="Категория">
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">Выберите категорию</option>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
                className="text-primary"
              >
                {formData.isActive ? (
                  <ToggleRight className="size-6" />
                ) : (
                  <ToggleLeft className="size-6" />
                )}
              </button>
              <span className="text-sm">{formData.isActive ? "Активна" : "Неактивна"}</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.price.trim()}
            >
              {editingService ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить услугу?</DialogTitle>
            <DialogDescription>
              Услуга «{deleteTarget?.name}» будет удалена. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggle,
}: {
  service: ServiceItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        !service.isActive && "opacity-60",
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-xl",
                service.isActive ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Sparkles className={cn("size-4", service.isActive ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <h3 className="text-sm font-medium leading-tight">{service.name}</h3>
              <Badge variant="outline" className="mt-0.5 text-[10px]">{service.category}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={onToggle} title={service.isActive ? "Деактивировать" : "Активировать"}>
              {service.isActive ? (
                <ToggleRight className="size-4 text-green-600" />
              ) : (
                <ToggleLeft className="size-4 text-muted-foreground" />
              )}
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onEdit}>
              <Edit className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onDelete}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        </div>

        {service.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{service.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />{service.duration} мин
            </span>
            <span className="flex items-center gap-1">
              <Tag className="size-3" />{service.appointmentsCount} записей
            </span>
          </div>
          <span className="text-sm font-bold text-primary">₽{service.price}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
