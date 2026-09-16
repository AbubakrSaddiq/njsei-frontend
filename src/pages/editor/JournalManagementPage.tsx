import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Tag,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { journalManagementService } from "@/services/journal.management.service";

interface Journal {
  id: number;
  title: string;
  slug: string;
  issn?: string;
  description?: string;
  is_published: boolean;
  published_at?: string;
  submissions_count: number;
  sections: Section[];
}

interface Section {
  id: number;
  title: string;
  slug: string;
  description?: string;
  sort_order: number;
}

const emptyJournalForm = { title: "", issn: "", description: "" };
const emptySectionForm = { title: "", description: "" };

export function JournalManagementPage() {
  const queryClient = useQueryClient();
  const [expandedJournal, setExpandedJournal] = useState<number | null>(null);
  const [journalModal, setJournalModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    journal?: Journal;
  }>({ open: false, mode: "create" });
  const [sectionModal, setSectionModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    journalId?: number;
    section?: Section;
  }>({ open: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: "journal" | "section";
    journalId?: number;
    sectionId?: number;
    name?: string;
  }>({ open: false, type: "journal" });

  const [journalForm, setJournalForm] = useState(emptyJournalForm);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);

  const { data, isLoading } = useQuery({
    queryKey: ["manage-journals"],
    queryFn: journalManagementService.getAll,
  });

  const journals: Journal[] = data?.journals ?? [];

  // Journal Mutations
  const createJournalMutation = useMutation({
    mutationFn: journalManagementService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Journal created successfully");
      setJournalModal({ open: false, mode: "create" });
      setJournalForm(emptyJournalForm);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to create journal");
    },
  });

  const updateJournalMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      title: string;
      issn?: string;
      description?: string;
    }) => journalManagementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Journal updated successfully");
      setJournalModal({ open: false, mode: "create" });
      setJournalForm(emptyJournalForm);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update journal");
    },
  });

  const publishMutation = useMutation({
    mutationFn: journalManagementService.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Journal published successfully");
    },
    onError: () => toast.error("Failed to publish journal"),
  });

  const unpublishMutation = useMutation({
    mutationFn: journalManagementService.unpublish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Journal unpublished");
    },
    onError: () => toast.error("Failed to unpublish journal"),
  });

  const deleteJournalMutation = useMutation({
    mutationFn: journalManagementService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Journal deleted");
      setDeleteModal({ open: false, type: "journal" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to delete journal");
    },
  });

  // Section Mutations
  const addSectionMutation = useMutation({
    mutationFn: ({
      journalId,
      ...data
    }: {
      journalId: number;
      title: string;
      description?: string;
    }) => journalManagementService.addSection(journalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Section added successfully");
      setSectionModal({ open: false, mode: "create" });
      setSectionForm(emptySectionForm);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to add section");
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({
      journalId,
      sectionId,
      ...data
    }: {
      journalId: number;
      sectionId: number;
      title: string;
      description?: string;
    }) => journalManagementService.updateSection(journalId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Section updated successfully");
      setSectionModal({ open: false, mode: "create" });
      setSectionForm(emptySectionForm);
    },
    onError: () => toast.error("Failed to update section"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: ({
      journalId,
      sectionId,
    }: {
      journalId: number;
      sectionId: number;
    }) => journalManagementService.deleteSection(journalId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-journals"] });
      toast.success("Section deleted");
      setDeleteModal({ open: false, type: "journal" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to delete section");
    },
  });

  const handleJournalSubmit = () => {
    if (!journalForm.title.trim()) {
      toast.error("Journal title is required");
      return;
    }

    if (journalModal.mode === "create") {
      createJournalMutation.mutate(journalForm);
    } else if (journalModal.journal) {
      updateJournalMutation.mutate({
        id: journalModal.journal.id,
        ...journalForm,
      });
    }
  };

  const handleSectionSubmit = () => {
    if (!sectionForm.title.trim()) {
      toast.error("Section title is required");
      return;
    }

    if (sectionModal.mode === "create" && sectionModal.journalId) {
      addSectionMutation.mutate({
        journalId: sectionModal.journalId,
        ...sectionForm,
      });
    } else if (
      sectionModal.mode === "edit" &&
      sectionModal.journalId &&
      sectionModal.section
    ) {
      updateSectionMutation.mutate({
        journalId: sectionModal.journalId,
        sectionId: sectionModal.section.id,
        ...sectionForm,
      });
    }
  };

  const openEditJournal = (journal: Journal) => {
    setJournalForm({
      title: journal.title,
      issn: journal.issn ?? "",
      description: journal.description ?? "",
    });
    setJournalModal({ open: true, mode: "edit", journal });
  };

  const openEditSection = (journalId: number, section: Section) => {
    setSectionForm({
      title: section.title,
      description: section.description ?? "",
    });
    setSectionModal({ open: true, mode: "edit", journalId, section });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">
            Journal Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage journals, sections and publication settings
          </p>
        </div>
        <Button
          onClick={() => {
            setJournalForm(emptyJournalForm);
            setJournalModal({ open: true, mode: "create" });
          }}
        >
          <Plus size={16} />
          New Journal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Journals", value: journals.length },
          {
            label: "Published",
            value: journals.filter((j) => j.is_published).length,
          },
          {
            label: "Total Sections",
            value: journals.reduce((acc, j) => acc + j.sections.length, 0),
          },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-2xl font-bold font-serif text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Journals List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : journals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 font-serif text-lg">
              No Journals Yet
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Create your first journal to get started.
            </p>
            <Button
              className="mt-6"
              onClick={() => setJournalModal({ open: true, mode: "create" })}
            >
              <Plus size={16} />
              Create Journal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => (
            <Card key={journal.id} padding="none" className="overflow-hidden">
              {/* Journal Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {journal.title}
                        </h3>
                        {journal.is_published ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                            Draft
                          </span>
                        )}
                      </div>
                      {journal.issn && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ISSN: {journal.issn}
                        </p>
                      )}
                      {journal.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {journal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">
                          {journal.sections.length} sections
                        </span>
                        <span className="text-xs text-gray-400">
                          {journal.submissions_count} submissions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {journal.is_published ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unpublishMutation.mutate(journal.id)}
                        loading={unpublishMutation.isPending}
                      >
                        <EyeOff size={13} />
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate(journal.id)}
                        loading={publishMutation.isPending}
                      >
                        <Globe size={13} />
                        Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditJournal(journal)}
                    >
                      <Edit size={13} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          type: "journal",
                          journalId: journal.id,
                          name: journal.title,
                        })
                      }
                    >
                      <Trash2 size={13} />
                    </Button>
                    <button
                      onClick={() =>
                        setExpandedJournal(
                          expandedJournal === journal.id ? null : journal.id,
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      {expandedJournal === journal.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Sections */}
              {expandedJournal === journal.id && (
                <div className="border-t border-gray-100">
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Tag size={14} className="text-primary" />
                      Sections ({journal.sections.length})
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSectionForm(emptySectionForm);
                        setSectionModal({
                          open: true,
                          mode: "create",
                          journalId: journal.id,
                        });
                      }}
                    >
                      <Plus size={13} />
                      Add Section
                    </Button>
                  </div>

                  {/* Sections List */}
                  {journal.sections.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400">
                      No sections yet. Add your first section.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {journal.sections
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((section) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Tag size={12} className="text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {section.title}
                                </p>
                                {section.description && (
                                  <p className="text-xs text-gray-400 truncate">
                                    {section.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() =>
                                  openEditSection(journal.id, section)
                                }
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                                title="Edit section"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    type: "section",
                                    journalId: journal.id,
                                    sectionId: section.id,
                                    name: section.title,
                                  })
                                }
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete section"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Journal Modal */}
      {journalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setJournalModal({ open: false, mode: "create" })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">
                  {journalModal.mode === "create"
                    ? "Create New Journal"
                    : "Edit Journal"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {journalModal.mode === "create"
                    ? "Fill in the details to create a new academic journal"
                    : "Update journal information"}
                </p>
              </div>
              <button
                onClick={() => setJournalModal({ open: false, mode: "create" })}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Journal Title"
                required
                placeholder="e.g. Journal of Engineering Science"
                value={journalForm.title}
                onChange={(e) =>
                  setJournalForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Input
                label="ISSN"
                placeholder="e.g. 1234-5678"
                hint="International Standard Serial Number (optional)"
                value={journalForm.issn}
                onChange={(e) =>
                  setJournalForm((prev) => ({ ...prev, issn: e.target.value }))
                }
              />
              <Textarea
                label="Description"
                placeholder="Describe the scope and aims of this journal..."
                rows={4}
                value={journalForm.description}
                onChange={(e) =>
                  setJournalForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              {/* Slug Preview */}
              {journalForm.title && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">URL slug preview:</p>
                  <p className="text-sm text-primary font-mono mt-0.5">
                    /journals/
                    {journalForm.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setJournalModal({ open: false, mode: "create" })}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={
                  createJournalMutation.isPending ||
                  updateJournalMutation.isPending
                }
                onClick={handleJournalSubmit}
              >
                <Save size={15} />
                {journalModal.mode === "create"
                  ? "Create Journal"
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {sectionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSectionModal({ open: false, mode: "create" })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">
                  {sectionModal.mode === "create"
                    ? "Add Section"
                    : "Edit Section"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sectionModal.mode === "create"
                    ? "Add a new section to this journal"
                    : "Update section details"}
                </p>
              </div>
              <button
                onClick={() => setSectionModal({ open: false, mode: "create" })}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Section Title"
                required
                placeholder="e.g. Original Research, Review Articles"
                value={sectionForm.title}
                onChange={(e) =>
                  setSectionForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Textarea
                label="Description"
                placeholder="Brief description of this section..."
                rows={3}
                value={sectionForm.description}
                onChange={(e) =>
                  setSectionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSectionModal({ open: false, mode: "create" })}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={
                  addSectionMutation.isPending ||
                  updateSectionMutation.isPending
                }
                onClick={handleSectionSubmit}
              >
                <Save size={15} />
                {sectionModal.mode === "create"
                  ? "Add Section"
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteModal({ open: false, type: "journal" })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-serif text-center mb-2">
              Delete {deleteModal.type === "journal" ? "Journal" : "Section"}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{deleteModal.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setDeleteModal({ open: false, type: "journal" })}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={
                  deleteJournalMutation.isPending ||
                  deleteSectionMutation.isPending
                }
                onClick={() => {
                  if (deleteModal.type === "journal" && deleteModal.journalId) {
                    deleteJournalMutation.mutate(deleteModal.journalId);
                  } else if (
                    deleteModal.type === "section" &&
                    deleteModal.journalId &&
                    deleteModal.sectionId
                  ) {
                    deleteSectionMutation.mutate({
                      journalId: deleteModal.journalId,
                      sectionId: deleteModal.sectionId,
                    });
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
