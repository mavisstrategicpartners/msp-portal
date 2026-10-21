import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Briefcase,
  Package as PackageIcon,
  Tag,
  Wrench,
  BookOpen,
  HelpCircle,
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Sliders,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// All 7 supported content tables
export type ContentTableKey =
  | "services"
  | "packages"
  | "pricing_items"
  | "tools"
  | "sops"
  | "glossary_terms"
  | "sales_faq";

interface TableMeta {
  key: ContentTableKey;
  label: string;
  singular: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  orderColumn: string;
  relatedQueryKeys: string[];
}

const TABLE_METAS: Record<ContentTableKey, TableMeta> = {
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    icon: Briefcase,
    description: "Core agency services shown on the Services catalog.",
    orderColumn: "sort_order",
    relatedQueryKeys: ["services", "services-all"],
  },
  packages: {
    key: "packages",
    label: "Packages",
    singular: "Package",
    icon: PackageIcon,
    description: "Monthly retainer tiers and package definitions on the Pricing page.",
    orderColumn: "sort_order",
    relatedQueryKeys: ["packages"],
  },
  pricing_items: {
    key: "pricing_items",
    label: "Pricing Items",
    singular: "Pricing Item",
    icon: Tag,
    description: "Line-item service pricing and add-ons displayed in the Pricing table.",
    orderColumn: "sort_order",
    relatedQueryKeys: ["pricing-items"],
  },
  tools: {
    key: "tools",
    label: "Tools & Software",
    singular: "Tool",
    icon: Wrench,
    description: "Agency software stack, credentials links, and tool guides.",
    orderColumn: "sort_order",
    relatedQueryKeys: ["tools", "tools-svc", "tools-lookup"],
  },
  sops: {
    key: "sops",
    label: "SOPs",
    singular: "SOP",
    icon: FileText,
    description: "Standard Operating Procedures and department workflow manuals.",
    orderColumn: "sort_order",
    relatedQueryKeys: ["sops"],
  },
  glossary_terms: {
    key: "glossary_terms",
    label: "Glossary Terms",
    singular: "Glossary Term",
    icon: BookOpen,
    description: "Industry terminology, abbreviations, and marketing vocabulary.",
    orderColumn: "term",
    relatedQueryKeys: ["glossary"],
  },
  sales_faq: {
    key: "sales_faq",
    label: "Sales FAQ",
    singular: "Sales FAQ",
    icon: HelpCircle,
    description: "Objection handling, pitch answers, and sales tips for the team.",
    orderColumn: "category",
    relatedQueryKeys: ["sales-faq"],
  },
};

const DEPARTMENTS = [
  "CEO",
  "Managing Director",
  "Operations Manager",
  "Client Relationship Manager",
  "Sales Team",
  "Social Media Manager",
  "Admin Department",
  "Human Resources",
  "Intern",
];

const PRICING_SECTIONS = [
  "Monthly Retainers",
  "Web Development & Design",
  "Ad Spend Management",
  "Setup & Audits",
  "Content & Creative Add-ons",
  "Automation & CRM",
  "Other Services",
];

const TOOL_CATEGORIES = [
  "CRM & Automation",
  "Design & Creative",
  "Communication & Project Management",
  "Analytics & Tracking",
  "Sales & Prospecting",
  "Dev & Hosting",
  "Other",
];

const FAQ_CATEGORIES = [
  "Pricing & Retainers",
  "Lead Generation & Guarantees",
  "Operations & Timelines",
  "Ad Spend & Billing",
  "Contracts & Deliverables",
  "Technical & Integrations",
  "General",
];

// Helper to make a URL slug from title
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function ContentEditor() {
  const [selectedTable, setSelectedTable] = useState<ContentTableKey>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const currentMeta = TABLE_METAS[selectedTable];

  // Fetch data for the active table
  const {
    data: items = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-content-table", selectedTable],
    queryFn: async () => {
      let query = (supabase as any).from(selectedTable).select("*");
      if (currentMeta.orderColumn === "sort_order") {
        query = query.order("sort_order", { ascending: true });
      } else {
        query = query.order(currentMeta.orderColumn, { ascending: true });
      }
      const { data, error } = await query;
      if (error) {
        console.error(`Error loading ${selectedTable}:`, error);
        throw error;
      }
      return data ?? [];
    },
  });

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item: any) => {
      const searchTargets = [
        item.name,
        item.title,
        item.term,
        item.question,
        item.slug,
        item.tagline,
        item.section,
        item.category,
        item.department,
        item.who_for,
        item.definition,
        item.approved_answer,
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase());
      return searchTargets.some((t) => t.includes(q));
    });
  }, [items, searchQuery]);

  // Save / Update mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      const cleanData = { ...formData };
      delete cleanData.id;
      delete cleanData.created_at;
      delete cleanData.updated_at;

      // Handle sort_order parse to integer
      if ("sort_order" in cleanData) {
        cleanData.sort_order = parseInt(cleanData.sort_order, 10) || 0;
      }

      if (isNewItem) {
        const { data, error } = await (supabase as any)
          .from(selectedTable)
          .insert(cleanData)
          .select()
          .single();
        if (error) throw error;

        // Try logging to audit_logs
        try {
          await (supabase as any).from("audit_logs").insert({
            action: `content_create_${selectedTable}`,
            target_id: data?.id,
            details: { table: selectedTable, name: data.name || data.title || data.term || data.question },
          });
        } catch {
          // silently continue
        }
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from(selectedTable)
          .update(cleanData)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;

        // Try logging to audit_logs
        try {
          await (supabase as any).from("audit_logs").insert({
            action: `content_update_${selectedTable}`,
            target_id: formData.id,
            details: { table: selectedTable, name: formData.name || formData.title || formData.term || formData.question },
          });
        } catch {
          // silently continue
        }
        return data;
      }
    },
    onSuccess: () => {
      toast.success(
        isNewItem
          ? `${currentMeta.singular} created successfully`
          : `${currentMeta.singular} updated successfully`
      );
      // Invalidate current table and any public user-facing query keys
      queryClient.invalidateQueries({ queryKey: ["admin-content-table", selectedTable] });
      currentMeta.relatedQueryKeys.forEach((k) => {
        queryClient.invalidateQueries({ queryKey: [k] });
      });
      setEditingItem(null);
    },
    onError: (err: any) => {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save changes. Please check input values.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(selectedTable).delete().eq("id", id);
      if (error) throw error;

      // Try logging to audit_logs
      try {
        await (supabase as any).from("audit_logs").insert({
          action: `content_delete_${selectedTable}`,
          target_id: id,
          details: { table: selectedTable },
        });
      } catch {
        // silently continue
      }
    },
    onSuccess: () => {
      toast.success(`${currentMeta.singular} deleted`);
      queryClient.invalidateQueries({ queryKey: ["admin-content-table", selectedTable] });
      currentMeta.relatedQueryKeys.forEach((k) => {
        queryClient.invalidateQueries({ queryKey: [k] });
      });
      setDeletingItem(null);
    },
    onError: (err: any) => {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete item.");
    },
  });

  const handleOpenAdd = () => {
    setIsNewItem(true);
    // Provide sensible defaults according to table
    const defaults: Record<string, any> = { sort_order: items.length + 1 };
    if (selectedTable === "services") {
      defaults.name = "";
      defaults.slug = "";
      defaults.tagline = "";
      defaults.who_for = "";
      defaults.what_we_do = "";
      defaults.client_receives = "";
      defaults.outcome = "";
    } else if (selectedTable === "packages") {
      defaults.name = "";
      defaults.price = "R0 / mo";
      defaults.best_for = "";
    } else if (selectedTable === "pricing_items") {
      defaults.section = PRICING_SECTIONS[0];
      defaults.name = "";
      defaults.description = "";
      defaults.price = "R0";
    } else if (selectedTable === "tools") {
      defaults.name = "";
      defaults.slug = "";
      defaults.category = TOOL_CATEGORIES[0];
      defaults.login_url = "";
      defaults.admin_only = false;
      defaults.what_it_is = "";
      defaults.why_we_use = "";
      defaults.how_to_use = "";
      defaults.who_uses = "";
    } else if (selectedTable === "sops") {
      defaults.title = "";
      defaults.slug = "";
      defaults.department = DEPARTMENTS[0];
      defaults.reports_to = "";
      defaults.oversees = "";
      defaults.primary_tools = "";
      defaults.role_purpose = "";
      defaults.core_responsibilities = "";
      defaults.daily_weekly_monthly = "";
      defaults.key_sops = "";
      defaults.kpis = "";
    } else if (selectedTable === "glossary_terms") {
      defaults.term = "";
      defaults.definition = "";
      defaults.full_definition = "";
      defaults.why_it_matters = "";
    } else if (selectedTable === "sales_faq") {
      defaults.category = FAQ_CATEGORIES[0];
      defaults.question = "";
      defaults.approved_answer = "";
      defaults.sales_tip = "";
    }
    setEditingItem(defaults);
  };

  const handleOpenEdit = (item: any) => {
    setIsNewItem(false);
    setEditingItem({ ...item });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sliders className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Admin Portal
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Content Editor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage live public content across the MSP portal. Changes immediately reflect for all users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="gap-2 bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add {currentMeta.singular}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {(Object.keys(TABLE_METAS) as ContentTableKey[]).map((key) => {
          const meta = TABLE_METAS[key];
          const Icon = meta.icon;
          const isActive = selectedTable === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedTable(key);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{meta.label}</span>
              {isActive && items.length > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[11px] font-semibold">
                  {items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Table Details & Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{currentMeta.label}</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredItems.length} {filteredItems.length === 1 ? "entry" : "entries"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{currentMeta.description}</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search ${currentMeta.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Loading {currentMeta.label.toLowerCase()}...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 p-6 text-center">
              <Layers className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">
                {searchQuery ? "No matching records found" : `No ${currentMeta.label.toLowerCase()} yet`}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? "Try searching for a different keyword or clear your filter."
                  : `Get started by clicking the "Add ${currentMeta.singular}" button above.`}
              </p>
              {!searchQuery && (
                <Button onClick={handleOpenAdd} size="sm" variant="outline" className="mt-2 gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add First {currentMeta.singular}
                </Button>
              )}
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    {selectedTable === "services" && (
                      <>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Target Audience</TableHead>
                        <TableHead>Expected Outcome</TableHead>
                        <TableHead className="w-16 text-center">Order</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                    {selectedTable === "packages" && (
                      <>
                        <TableHead>Package Tier</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Best For</TableHead>
                        <TableHead className="w-16 text-center">Order</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                    {selectedTable === "pricing_items" && (
                      <>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-16 text-center">Order</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                    {selectedTable === "tools" && (
                      <>
                        <TableHead>Tool Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Target Users</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                    {selectedTable === "sops" && (
                      <>
                        <TableHead>SOP Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Reports To</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                    {selectedTable === "glossary_terms" && (
                      <>
                        <TableHead className="w-48">Term</TableHead>
                        <TableHead>Definition</TableHead>
                        <TableHead>Why It Matters</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                    {selectedTable === "sales_faq" && (
                      <>
                        <TableHead className="w-48">Category</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Approved Answer</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      {selectedTable === "services" && (
                        <>
                          <TableCell className="font-medium text-foreground">
                            <div>{item.name}</div>
                            {item.tagline && (
                              <div className="text-xs text-muted-foreground">{item.tagline}</div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {item.slug}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {item.who_for || "—"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {item.outcome || "—"}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                            {item.sort_order ?? 0}
                          </TableCell>
                        </>
                      )}

                      {selectedTable === "packages" && (
                        <>
                          <TableCell className="font-semibold text-foreground">
                            {item.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold text-primary">
                            {item.price}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.best_for || "—"}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                            {item.sort_order ?? 0}
                          </TableCell>
                        </>
                      )}

                      {selectedTable === "pricing_items" && (
                        <>
                          <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.section}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold text-primary">
                            {item.price}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                            {item.description || "—"}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                            {item.sort_order ?? 0}
                          </TableCell>
                        </>
                      )}

                      {selectedTable === "tools" && (
                        <>
                          <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {item.category || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.admin_only ? (
                              <Badge variant="destructive" className="gap-1 text-[10px]">
                                <Shield className="h-3 w-3" />
                                Admin Only
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                Team Wide
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.who_uses || "All staff"}
                          </TableCell>
                          <TableCell>
                            {item.login_url ? (
                              <a
                                href={item.login_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                Link <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </>
                      )}

                      {selectedTable === "sops" && (
                        <>
                          <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-normal">
                              {item.department}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {item.slug}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.reports_to || "—"}
                          </TableCell>
                        </>
                      )}

                      {selectedTable === "glossary_terms" && (
                        <>
                          <TableCell className="font-semibold text-foreground">{item.term}</TableCell>
                          <TableCell className="max-w-[280px] text-xs text-muted-foreground">
                            {item.definition}
                          </TableCell>
                          <TableCell className="max-w-[240px] text-xs text-muted-foreground">
                            {item.why_it_matters || "—"}
                          </TableCell>
                        </>
                      )}

                      {selectedTable === "sales_faq" && (
                        <>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[260px] font-medium text-foreground">
                            {item.question}
                          </TableCell>
                          <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
                            {item.approved_answer}
                          </TableCell>
                        </>
                      )}

                      {/* Row Action Buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingItem(item)}
                            title="Delete"
                            className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Create / Edit Modal Dialog */}
      {editingItem && (
        <EditItemDialog
          table={selectedTable}
          meta={currentMeta}
          item={editingItem}
          isNew={isNewItem}
          open={!!editingItem}
          isSaving={saveMutation.isPending}
          onClose={() => setEditingItem(null)}
          onSave={(data) => saveMutation.mutate(data)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingItem && (
        <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle>Delete {currentMeta.singular}</DialogTitle>
              </div>
              <DialogDescription className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {deletingItem.name ||
                    deletingItem.title ||
                    deletingItem.term ||
                    deletingItem.question ||
                    "this item"}
                </span>
                ? This action immediately deletes it from the Supabase database.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeletingItem(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deletingItem.id)}
                disabled={deleteMutation.isPending}
                className="gap-2"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Inner Form Dialog Component for robust, typed inputs per table
function EditItemDialog({
  table,
  meta,
  item,
  isNew,
  open,
  isSaving,
  onClose,
  onSave,
}: {
  table: ContentTableKey;
  meta: TableMeta;
  item: any;
  isNew: boolean;
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState<any>({ ...item });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug when name or title changes if slug was empty
      if (isNew && (field === "name" || field === "title") && !prev.slugModified) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSlugManualEdit = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      slug: value,
      slugModified: true,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (table === "services" && !formData.name?.trim()) {
      toast.error("Service Name is required");
      return;
    }
    if (table === "services" && !formData.slug?.trim()) {
      toast.error("Service Slug is required");
      return;
    }
    if (table === "packages" && !formData.name?.trim()) {
      toast.error("Package Name is required");
      return;
    }
    if (table === "pricing_items" && !formData.name?.trim()) {
      toast.error("Item Name is required");
      return;
    }
    if (table === "tools" && !formData.name?.trim()) {
      toast.error("Tool Name is required");
      return;
    }
    if (table === "sops" && !formData.title?.trim()) {
      toast.error("SOP Title is required");
      return;
    }
    if (table === "glossary_terms" && !formData.term?.trim()) {
      toast.error("Glossary Term is required");
      return;
    }
    if (table === "sales_faq" && !formData.question?.trim()) {
      toast.error("Question is required");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isNew ? `Add New ${meta.singular}` : `Edit ${meta.singular}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fill in the details below. Changes are saved directly to the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* SERVICES FORM */}
          {table === "services" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Service Name *</label>
                  <Input
                    required
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Paid Advertising System"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Slug (URL key) *</label>
                  <Input
                    required
                    value={formData.slug || ""}
                    onChange={(e) => handleSlugManualEdit(e.target.value)}
                    placeholder="e.g. paid-advertising"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tagline</label>
                <Input
                  value={formData.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="One sentence summary of the service"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Who It Is For</label>
                  <Textarea
                    rows={2}
                    value={formData.who_for || ""}
                    onChange={(e) => handleChange("who_for", e.target.value)}
                    placeholder="e.g. Scaling B2B and e-commerce companies"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Expected Outcome</label>
                  <Textarea
                    rows={2}
                    value={formData.outcome || ""}
                    onChange={(e) => handleChange("outcome", e.target.value)}
                    placeholder="e.g. Consistent qualified pipeline and measurable ROAS"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">What We Do (Execution)</label>
                <Textarea
                  rows={3}
                  value={formData.what_we_do || ""}
                  onChange={(e) => handleChange("what_we_do", e.target.value)}
                  placeholder="Bullet points or sentences separated by · or newlines"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">What Client Receives (Deliverables)</label>
                <Textarea
                  rows={2}
                  value={formData.client_receives || ""}
                  onChange={(e) => handleChange("client_receives", e.target.value)}
                  placeholder="e.g. Ad copy, weekly dashboards, monthly executive review"
                />
              </div>

              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                />
              </div>
            </>
          )}

          {/* PACKAGES FORM */}
          {table === "packages" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Package Name *</label>
                  <Input
                    required
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Growth Pro Retainer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Price Label *</label>
                  <Input
                    required
                    value={formData.price || ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="e.g. R15,000 / month"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Best For</label>
                <Textarea
                  rows={3}
                  value={formData.best_for || ""}
                  onChange={(e) => handleChange("best_for", e.target.value)}
                  placeholder="Describe the target client tier, business size, and deliverables scope"
                />
              </div>

              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                />
              </div>
            </>
          )}

          {/* PRICING ITEMS FORM */}
          {table === "pricing_items" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Section *</label>
                  <Select
                    value={formData.section || PRICING_SECTIONS[0]}
                    onValueChange={(val) => handleChange("section", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_SECTIONS.map((sec) => (
                        <SelectItem key={sec} value={sec}>
                          {sec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Price *</label>
                  <Input
                    required
                    value={formData.price || ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="e.g. R6,500 once-off or R3,500/mo"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Item Name *</label>
                <Input
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Meta Ads Setup & Pixel Integration"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Scope details and deliverables for this line item"
                />
              </div>

              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                />
              </div>
            </>
          )}

          {/* TOOLS & SOFTWARE FORM */}
          {table === "tools" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Tool Name *</label>
                  <Input
                    required
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. GoHighLevel"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Slug *</label>
                  <Input
                    required
                    value={formData.slug || ""}
                    onChange={(e) => handleSlugManualEdit(e.target.value)}
                    placeholder="e.g. gohighlevel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <Select
                    value={formData.category || TOOL_CATEGORIES[0]}
                    onValueChange={(val) => handleChange("category", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOOL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Login / Portal URL</label>
                  <Input
                    type="url"
                    value={formData.login_url || ""}
                    onChange={(e) => handleChange("login_url", e.target.value)}
                    placeholder="https://app.example.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-secondary/20">
                <input
                  type="checkbox"
                  id="admin_only"
                  checked={!!formData.admin_only}
                  onChange={(e) => handleChange("admin_only", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="admin_only" className="cursor-pointer text-xs font-medium text-foreground">
                  Admin Only Access (Restricted credentials/visibility)
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">What It Is</label>
                  <Textarea
                    rows={2}
                    value={formData.what_it_is || ""}
                    onChange={(e) => handleChange("what_it_is", e.target.value)}
                    placeholder="Short description of the software"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Why We Use It</label>
                  <Textarea
                    rows={2}
                    value={formData.why_we_use || ""}
                    onChange={(e) => handleChange("why_we_use", e.target.value)}
                    placeholder="Agency benefit and operational efficiency"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">How To Use It</label>
                  <Textarea
                    rows={2}
                    value={formData.how_to_use || ""}
                    onChange={(e) => handleChange("how_to_use", e.target.value)}
                    placeholder="Standard SOP guide or setup instructions"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Who Uses It</label>
                  <Textarea
                    rows={2}
                    value={formData.who_uses || ""}
                    onChange={(e) => handleChange("who_uses", e.target.value)}
                    placeholder="e.g. Sales Team, Operations, Account Managers"
                  />
                </div>
              </div>

              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                />
              </div>
            </>
          )}

          {/* SOPS FORM */}
          {table === "sops" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">SOP Title *</label>
                  <Input
                    required
                    value={formData.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Operations Manager SOP"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Slug *</label>
                  <Input
                    required
                    value={formData.slug || ""}
                    onChange={(e) => handleSlugManualEdit(e.target.value)}
                    placeholder="e.g. operations-manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Department *</label>
                  <Select
                    value={formData.department || DEPARTMENTS[0]}
                    onValueChange={(val) => handleChange("department", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Reports To</label>
                  <Input
                    value={formData.reports_to || ""}
                    onChange={(e) => handleChange("reports_to", e.target.value)}
                    placeholder="e.g. Managing Director"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Oversees</label>
                  <Input
                    value={formData.oversees || ""}
                    onChange={(e) => handleChange("oversees", e.target.value)}
                    placeholder="e.g. CRM, Delivery, Social"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Primary Tools</label>
                <Input
                  value={formData.primary_tools || ""}
                  onChange={(e) => handleChange("primary_tools", e.target.value)}
                  placeholder="e.g. Notion, Slack, Meta Ads Manager, GHL"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Role Purpose</label>
                <Textarea
                  rows={2}
                  value={formData.role_purpose || ""}
                  onChange={(e) => handleChange("role_purpose", e.target.value)}
                  placeholder="Core mission and objective of this role"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Core Responsibilities</label>
                <Textarea
                  rows={3}
                  value={formData.core_responsibilities || ""}
                  onChange={(e) => handleChange("core_responsibilities", e.target.value)}
                  placeholder="List main responsibilities, separated by bullet points or newlines"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Daily / Weekly / Monthly Routine</label>
                <Textarea
                  rows={3}
                  value={formData.daily_weekly_monthly || ""}
                  onChange={(e) => handleChange("daily_weekly_monthly", e.target.value)}
                  placeholder="Key cadences, standups, and reporting deadlines"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Key SOPs / Checklists</label>
                  <Textarea
                    rows={2}
                    value={formData.key_sops || ""}
                    onChange={(e) => handleChange("key_sops", e.target.value)}
                    placeholder="Related procedural documents"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">KPIs & Targets</label>
                  <Textarea
                    rows={2}
                    value={formData.kpis || ""}
                    onChange={(e) => handleChange("kpis", e.target.value)}
                    placeholder="e.g. 95% retention, under 10min lead response"
                  />
                </div>
              </div>

              <div className="w-32 space-y-1">
                <label className="text-xs font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                />
              </div>
            </>
          )}

          {/* GLOSSARY TERMS FORM */}
          {table === "glossary_terms" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Term *</label>
                <Input
                  required
                  value={formData.term || ""}
                  onChange={(e) => handleChange("term", e.target.value)}
                  placeholder="e.g. CAC (Customer Acquisition Cost)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Definition *</label>
                <Textarea
                  required
                  rows={3}
                  value={formData.definition || ""}
                  onChange={(e) => handleChange("definition", e.target.value)}
                  placeholder="Concise definition of the term"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Why It Matters</label>
                <Textarea
                  rows={2}
                  value={formData.why_it_matters || ""}
                  onChange={(e) => handleChange("why_it_matters", e.target.value)}
                  placeholder="Why this metric or concept matters for our clients and delivery"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Full / Technical Details (Optional)</label>
                <Textarea
                  rows={2}
                  value={formData.full_definition || ""}
                  onChange={(e) => handleChange("full_definition", e.target.value)}
                  placeholder="Calculation formula or extended explanation"
                />
              </div>
            </>
          )}

          {/* SALES FAQ FORM */}
          {table === "sales_faq" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category *</label>
                <Select
                  value={formData.category || FAQ_CATEGORIES[0]}
                  onValueChange={(val) => handleChange("category", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Question *</label>
                <Textarea
                  required
                  rows={2}
                  value={formData.question || ""}
                  onChange={(e) => handleChange("question", e.target.value)}
                  placeholder="e.g. Do we guarantee results or lead volume?"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Approved Answer *</label>
                <Textarea
                  required
                  rows={3}
                  value={formData.approved_answer || ""}
                  onChange={(e) => handleChange("approved_answer", e.target.value)}
                  placeholder="The standard, brand-approved verbal/written answer to give clients"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Internal Sales Tip</label>
                <Textarea
                  rows={2}
                  value={formData.sales_tip || ""}
                  onChange={(e) => handleChange("sales_tip", e.target.value)}
                  placeholder="Advice for the salesperson when encountering this objection"
                />
              </div>
            </>
          )}

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {isNew ? "Create Entry" : "Save Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
