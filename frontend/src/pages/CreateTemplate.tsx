import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Variable,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createTemplateApi,
  deleteTemplateApi,
  getEmailTemplateByIdApi,
  updateTemplateApi,
} from "../apis/email.api";
import { useAuthContext } from "../hooks";
import {
  BLANK_TEMPLATE,
  OTP_TEMPLATE,
  SIMPLE_TEMPLATE,
  WELCOME_TEMPLATE,
  extractVariables,
} from "../utils/templateHelpers";

interface TemplateForm {
  name: string;
  slug: string;
  subject: string;
  html: string;
  description: string;
}

export const CreateTemplate = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const isEditMode = Boolean(templateId);
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const isGuest = user?.userType?.toLowerCase() === "guest";

  const [form, setForm] = useState<TemplateForm>({
    name: "",
    slug: "",
    subject: "",
    html: BLANK_TEMPLATE,
    description: "",
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [initialSlug, setInitialSlug] = useState("");

  const [isLoadingTemplate, setIsLoadingTemplate] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Debounced state for variable extraction to avoid lag on large HTML input
  const [debouncedState, setDebouncedState] = useState({
    html: form.html,
    subject: form.subject,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedState({ html: form.html, subject: form.subject });
    }, 300);
    return () => clearTimeout(handler);
  }, [form.html, form.subject]);

  const detectedVars = useMemo(
    () => extractVariables(debouncedState.html, debouncedState.subject),
    [debouncedState.html, debouncedState.subject],
  );

  // Slug validation: lowercase letters, numbers, hyphens, underscores
  const isSlugInvalid = useMemo(() => {
    if (!form.slug) return false;
    return /[^a-z0-9-_]/.test(form.slug);
  }, [form.slug]);

  // Load existing template data in edit mode
  useEffect(() => {
    if (isEditMode && templateId) {
      setIsLoadingTemplate(true);
      getEmailTemplateByIdApi(templateId)
        .then((res) => {
          if (res?.data) {
            const data = res.data;
            setForm({
              name: data.name || "",
              slug: data.slug || data.templateId || "",
              subject: data.subject || "",
              html: data.html || BLANK_TEMPLATE,
              description: data.description || "",
            });
            setInitialSlug(data.slug || data.templateId || "");
          }
        })
        .catch((err) => {
          console.error("Failed to load template:", err);
          toast.error("Failed to load template data");
          navigate("/templates");
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
  }, [isEditMode, templateId, navigate]);

  // Handle template name change with auto-slug generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGuest) return;
    const name = e.target.value;
    setForm((prev) => {
      const newForm = { ...prev, name };
      if (!slugManuallyEdited && !isEditMode) {
        newForm.slug = name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }
      return newForm;
    });
  };

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGuest) return;
    setForm((prev) => ({ ...prev, slug: e.target.value }));
    setSlugManuallyEdited(true);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      toast.error("Guest users are not allowed to create or edit templates");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Template ID / Slug is required");
      return;
    }
    if (isSlugInvalid) {
      toast.error("Template ID contains invalid characters");
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!form.html.trim()) {
      toast.error("HTML content is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && templateId) {
        await updateTemplateApi(templateId, {
          name: form.name,
          slug: form.slug,
          subject: form.subject,
          html: form.html,
          description: form.description,
        });
        toast.success("Template updated");
        navigate("/templates");
      } else {
        await createTemplateApi({
          name: form.name,
          slug: form.slug,
          subject: form.subject,
          html: form.html,
          description: form.description,
        });
        toast.success("Template created");
        navigate("/templates");
      }
    } catch (err: any) {
      console.error("Submit template error:", err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409) {
        toast.error("Template ID already exists — choose a different one");
      } else if (isEditMode) {
        toast.error(message || "Failed to update template");
      } else {
        toast.error(message || "Failed to create template");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete template handler
  const handleDelete = async () => {
    if (!templateId) return;

    if (isGuest) {
      toast.error("Guest users are not allowed to delete templates");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTemplateApi(templateId);
      toast.success("Template deleted successfully");
      navigate("/templates");
    } catch (err: any) {
      console.error("Delete template error:", err);
      const message = err?.response?.data?.message;
      if (err?.response?.status === 400) {
        toast.error(message || "Default templates cannot be deleted");
      } else {
        toast.error(message || "Failed to delete template");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Helper to render subject preview with variable badges
  const renderSubjectPreview = () => {
    if (!form.subject) {
      return <span className="text-gray-400 italic">No subject specified</span>;
    }

    const parts = form.subject.split(/(\{\{\w+\}\})/g);
    return parts.map((part, index) => {
      const match = part.match(/^\{\{(\w+)\}\}$/);
      if (match) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700 font-semibold border border-gray-200 mx-0.5"
          >
            {match[1]}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="">
      {/* Back navigation */}
      <button
        onClick={() => navigate("/templates")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to templates
      </button>

      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-lg font-medium text-gray-900">
            {isEditMode ? "Edit Template" : "Create Template"}
          </h1>
          {isGuest && (
            <span className="text-xs text-gray-500">
              (Guest users cannot create, edit, or delete templates.)
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEditMode
            ? "Update your existing email template details and content"
            : "Design and configure a new email template for your application"}
        </p>
      </div>

      {isLoadingTemplate ? (
        /* Skeleton Loading State for Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-gray-400 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-9 bg-gray-200 rounded w-full"></div>
              <div className="h-9 bg-gray-200 rounded w-full"></div>
              <div className="h-16 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="bg-white border border-gray-400 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-9 bg-gray-200 rounded w-full"></div>
              <div className="h-64 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-400 p-6 h-96 animate-pulse"></div>
          </div>
        </div>
      ) : (
        /* Main Two-Column Layout */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT PANEL — Form (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section 1 — Basic Info Card */}
            <div className="bg-white border border-gray-400 p-6 ">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <FileText size={16} className="text-gray-600" />
                <h2 className="text-sm font-medium text-gray-900">
                  Basic Information
                </h2>
              </div>

              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isGuest}
                    placeholder="e.g. Welcome Email"
                    value={form.name}
                    onChange={handleNameChange}
                    className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-400 text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Template ID / Slug */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Template ID / Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isGuest}
                    placeholder="e.g. welcome-email"
                    value={form.slug}
                    onChange={handleSlugChange}
                    className={`w-full h-9 px-3 text-sm bg-gray-50 border text-gray-900 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isSlugInvalid
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                      }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the templateId you pass in your API call
                  </p>

                  {/* Slug Validation Error */}
                  {isSlugInvalid && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Template ID must contain only lowercase letters, numbers, hyphens, and underscores.
                    </p>
                  )}

                  {/* Amber Warning in Edit Mode */}
                  {isEditMode && initialSlug && form.slug !== initialSlug && (
                    <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                      <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        Changing the template ID will break existing API calls using the old ID
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    disabled={isGuest}
                    placeholder="Brief description of when this email template is sent..."
                    value={form.description}
                    onChange={(e) =>
                      !isGuest && setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-400 text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 — Email Content Card */}
            <div className="bg-white border border-gray-400 p-6 ">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-sm font-medium text-gray-900">
                  Email Content
                </h2>
              </div>

              <div className="space-y-5">
                {/* Subject Input */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isGuest}
                    placeholder="e.g. Welcome to {{appName}}, {{name}}!"
                    value={form.subject}
                    onChange={(e) =>
                      !isGuest && setForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-400 text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {"{{variableName}}"} for dynamic values
                  </p>
                </div>

                <hr className="border-gray-100 my-4" />

                {/* HTML Body Header & Starter Templates */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-medium text-gray-600 block">
                      HTML Body <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-gray-400 mr-1">Starters:</span>
                      <button
                        type="button"
                        disabled={isGuest}
                        onClick={() =>
                          !isGuest && setForm((prev) => ({ ...prev, html: BLANK_TEMPLATE }))
                        }
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Blank
                      </button>
                      <button
                        type="button"
                        disabled={isGuest}
                        onClick={() =>
                          !isGuest && setForm((prev) => ({ ...prev, html: SIMPLE_TEMPLATE }))
                        }
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Simple
                      </button>
                      <button
                        type="button"
                        disabled={isGuest}
                        onClick={() =>
                          !isGuest && setForm((prev) => ({ ...prev, html: WELCOME_TEMPLATE }))
                        }
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Welcome
                      </button>
                      <button
                        type="button"
                        disabled={isGuest}
                        onClick={() =>
                          !isGuest && setForm((prev) => ({ ...prev, html: OTP_TEMPLATE }))
                        }
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        OTP
                      </button>
                    </div>
                  </div>

                  {/* HTML Textarea */}
                  <textarea
                    required
                    disabled={isGuest}
                    rows={16}
                    value={form.html}
                    onChange={(e) =>
                      !isGuest && setForm((prev) => ({ ...prev, html: e.target.value }))
                    }
                    placeholder="Write your HTML email here. Use {{variableName}} for dynamic content."
                    className="w-full font-mono text-xs leading-relaxed min-h-[400px] resize-y bg-gray-950 text-gray-300 border border-gray-800 p-4 focus:outline-none focus:border-gray-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isGuest}
                className="w-full h-9 px-4 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                title={isGuest ? "Guest users cannot save templates" : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Template...</span>
                  </>
                ) : (
                  <span>Save Template</span>
                )}
              </button>

              {isEditMode && (
                <div>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      disabled={isGuest}
                      onClick={() => !isGuest && setShowDeleteConfirm(true)}
                      className="w-full h-9 px-4 bg-white text-red-500 border border-red-200 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      title={isGuest ? "Guest users cannot delete templates" : undefined}
                    >
                      <Trash2 size={15} />
                      <span>Delete Template</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                      <p className="text-xs font-medium text-red-800">
                        Are you sure? This cannot be undone
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isDeleting || isGuest}
                          onClick={handleDelete}
                          className="h-8 px-3 bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isGuest ? "Guest users cannot delete templates" : undefined}
                        >
                          {isDeleting && <Loader2 size={13} className="animate-spin" />}
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setShowDeleteConfirm(false)}
                          className="h-8 px-3 bg-white border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL — Sticky Live Preview (2/5 width) */}
          <div className="lg:col-span-2">
            <div className="sticky top-4 h-[calc(100vh-6rem)] flex flex-col gap-4">
              {/* Card 1 — Live Preview */}
              <div className="flex-1 flex flex-col bg-white border border-gray-400 overflow-hidden ">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-gray-600" />
                    <span className="text-xs font-semibold text-gray-900">
                      Live preview
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Updates as you type</span>
                </div>

                {/* Subject preview bar */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-800 flex items-center gap-1 flex-wrap shrink-0">
                  <span className="text-gray-400 font-normal mr-1">Subject:</span>
                  {renderSubjectPreview()}
                </div>

                {/* Live Preview iframe */}
                <iframe
                  title="Live Preview"
                  srcDoc={form.html}
                  sandbox="allow-same-origin"
                  className="flex-1 w-full border-none bg-white"
                />
              </div>

              {/* Card 2 — Detected Variables */}
              <div className="bg-white border border-gray-400 p-4 shrink-0  max-h-[220px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Variable size={16} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-900">
                    Detected variables
                  </span>
                </div>

                {detectedVars.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    No {"{{variables}}"} found in your template yet
                  </p>
                ) : (
                  <div>
                    {/* a) Variable pills row */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {detectedVars.map((v) => (
                        <span
                          key={v}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-50 text-gray-700 border border-gray-200 font-medium"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>

                    {/* b) API snippet */}
                    <div className="bg-gray-950  p-3 font-mono text-xs text-gray-300 border border-gray-800 overflow-x-auto">
                      <p className="text-[10px] text-gray-500 mb-1.5">
                        // Developer API variables payload
                      </p>
                      <pre className="text-[11px] leading-relaxed text-gray-300">
                        {`"variables": [
${detectedVars
                            .map(
                              (v) => `  { "variableName": "${v}", "variableValue": "..." }`
                            )
                            .join(",\n")}
]`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
