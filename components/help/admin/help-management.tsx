"use client";

import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTable } from "@/components/data-table/data-table";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import FormTrigger from "@/components/form-trigger";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { HelpMarkdownEditor } from "@/components/help/admin/help-markdown-editor";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { type ApiResponse, type PaginatedApiResponse } from "@/hooks/use-api-query";

const ARTICLE_URL = "platform-help-admin/articles";
const CATEGORY_URL = "platform-help-admin/categories";
const kinds = ["guide", "faq", "video"] as const;
const statuses = ["draft", "published", "archived"] as const;
const required = "help.management.required";

const categorySchema = z.object({
  name_en: z.string().trim().min(1, required).max(150),
  name_bn: z.string().trim().min(1, required).max(150),
});
const localized = (limit: number) => z.string().trim().max(limit).nullish();
const articleSchema = z.object({
  category_id: z.coerce.number().int().positive(required),
  kind: z.enum(kinds),
  status: z.enum(statuses),
  title_en: z.string().trim().min(1, required).max(255), title_bn: localized(255),
  summary_en: localized(16000), summary_bn: localized(16000),
  article_en: localized(200000), article_bn: localized(200000),
  video_url_en: localized(2048),
}).superRefine((article, context) => {
  if (article.status !== "published") return;
  for (const key of ["title_bn", "article_en", "article_bn"] as const) {
    if (article.kind === "video" && key.startsWith("article_")) continue;
    if (!article[key]) context.addIssue({ code: "custom", path: [key], message: required });
  }
  if (article.kind === "video" && !article.video_url_en) {
    context.addIssue({ code: "custom", path: ["video_url_en"], message: "help.management.video_required" });
  }
});

type Category = z.infer<typeof categorySchema> & { id: number };
type Article = Pick<z.infer<typeof articleSchema>, "kind" | "status" | "title_en" | "title_bn"> & { id: number };

function field(name: string, mandatory = false): FormFieldConfig {
  return { name, type: "text", label: { labelText: `help.management.fields.${name}`, mandatory } };
}

const titles = [field("title_en", true), field("title_bn")];
const editorGroups = (["en", "bn"] as const).map((locale) =>
  (["summary", "article"] as const).map((type) => ({ name: `${type}_${locale}`, body: type === "article" }))
);
const videoField = field("video_url_en");

function CategoryDialog({ row }: { row?: Category }) {
  return (
    <MyDialog title={row ? "help.management.edit_category" : "help.management.add_category"} trigger={<FormTrigger mode={row ? "edit" : "create"} />}>
      <FormBuilder
        mode={row ? "edit" : "create"} method={row ? "PUT" : "POST"}
        api={CATEGORY_URL} data={row} hydrateOnEdit="never" queryKey={CATEGORY_URL}
        schema={categorySchema} formSchema={[field("name_en", true), field("name_bn", true)]}
      />
    </MyDialog>
  );
}

function ArticleDialog({ row, categories, locale, categoriesLoading }: { row?: Article; categories: Category[]; locale: "en" | "bn"; categoriesLoading: boolean }) {
  const { t } = useTranslation();
  const shared: FormFieldConfig[] = [
    { name: "category_id", type: "dropdown", label: { labelText: "help.management.category" },
      isLoading: categoriesLoading, isDisabled: categoriesLoading, options: categories.map((item) => ({ value: item.id, label: item[`name_${locale}`] })) },
    { name: "kind", type: "dropdown", label: { labelText: "help.management.kind" },
      options: kinds.map((value) => ({ value, label: t(`help.management.${value}`) })) },
    { name: "status", type: "dropdown", label: { labelText: "help.management.status" },
      options: statuses.map((value) => ({ value, label: t(`help.management.${value}`) })) },
  ];

  return (
    <MyDialog size="2xl" contentClassName="h-[min(90dvh,47rem)]" title={row ? "help.management.edit_article" : "help.management.add_article"} trigger={<FormTrigger mode={row ? "edit" : "create"} />}>
      <FormBuilder mode={row ? "edit" : "create"} method={row ? "PUT" : "POST"} api={ARTICLE_URL}
        data={row ? { id: row.id } : { kind: "guide", status: "draft" }}
        queryKey={ARTICLE_URL} schema={articleSchema} grids={2}
        formSchema={[...titles, ...shared, ...editorGroups.flat().map(({ name }) => field(name)), videoField]}>
        {(renderField) => (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">{titles.map((item) => <div key={item.name}>{renderField(item)}</div>)}</div>
            <div className="grid gap-3 sm:grid-cols-3">{shared.map((item) => <div key={item.name}>{renderField(item)}</div>)}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              {editorGroups.map((group) => (
                <div key={group[0].name} className="min-w-0 space-y-3">
                  {group.map(({ name, body }) => <HelpMarkdownEditor key={name} name={name} body={body} />)}
                </div>
              ))}
            </div>
            {renderField(videoField)}
          </div>
        )}
      </FormBuilder>
    </MyDialog>
  );
}

export function HelpArticlesTable() {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const locale = i18n.language === "bn" ? "bn" : "en";
  const canReadArticles = hasPermission("platform-help-admin.articles.access");
  const canReadCategories = hasPermission("platform-help-admin.categories.access");
  const canPreview = hasPermission("platform-help-admin.articles.show");
  const canEditArticles = canPreview && canReadCategories && hasPermission("platform-help-admin.articles.update");
  const canAddArticles = canReadCategories && hasPermission("platform-help-admin.articles.create");
  const categories = useApiQuery<ApiResponse<Category[]>>({ queryKey: [CATEGORY_URL], url: CATEGORY_URL, pagination: false, enabled: canReadCategories });
  const articles = useApiQuery<PaginatedApiResponse<Article>>({ queryKey: [ARTICLE_URL], url: ARTICLE_URL, enabled: canReadArticles });
  const categoryRows = categories.data?.data ?? [];
  const categoryProps = { categories: categoryRows, locale, categoriesLoading: categories.isLoading } as const;
  const pagination = articles.data?.data?.pagination;
  const articleColumns: ColumnDef<Article>[] = [
    { id: "title", accessorFn: (row) => row[`title_${locale}`] || row.title_en || "—",
      header: ({ column }) => <DataTableColumnHeader column={column} title="help.management.title" />,
      enableSorting: false, enableHiding: false },
    { id: "content_type", accessorKey: "kind", header: ({ column }) => <DataTableColumnHeader column={column} title="help.management.kind" />, enableSorting: false, cell: ({ row }) => t(`help.management.${row.original.kind}`) },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="help.management.status" />, enableSorting: false, cell: ({ row }) => t(`help.management.${row.original.status}`) },
    { id: "actions", enableHiding: false, enableSorting: false, header: ({ column }) => <DataTableColumnHeader column={column} className="pe-3 text-end" title="common.actions" />, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2 pe-3">
        {canPreview && <MyButton variant="outline" url={`/help-management/preview/${row.original.id}`} title="help.management.preview" />}
        {canEditArticles && <ArticleDialog row={row.original} {...categoryProps} />}
      </div>
    ) },
  ];
  if (!canReadArticles) return <p role="alert">{t("platform_support.errors.forbidden")}</p>;

  const title = t("help.management.articles");
  return (
    <>
      {(articles.isError || categories.isError) && <p role="alert">{t("help.error")}</p>}
      <DataTable columns={articleColumns} data={articles.data?.data?.data ?? []}
        pagination={pagination} setCurrentPage={articles.setCurrentPage}
        isLoading={articles.isLoading} isFetching={articles.isFetching}
        queryKey={ARTICLE_URL} toggleColumns toolbarTitle={pagination?.total ? `${title} (${pagination.total})` : title}
        toolbarBeforeForm={canAddArticles && <ArticleDialog {...categoryProps} />} />
    </>
  );
}

export function HelpCategoriesTable() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("platform-help-admin.categories.access");
  const canEdit = hasPermission("platform-help-admin.categories.update");
  const categories = useApiQuery<ApiResponse<Category[]>>({ queryKey: [CATEGORY_URL], url: CATEGORY_URL, pagination: false, enabled: canRead });
  const rows = categories.data?.data ?? [];
  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name_en", header: ({ column }) => <DataTableColumnHeader column={column} title="help.management.fields.name_en" />, enableSorting: false, enableHiding: false },
    { accessorKey: "name_bn", header: ({ column }) => <DataTableColumnHeader column={column} title="help.management.fields.name_bn" />, enableSorting: false },
    { id: "actions", enableHiding: false, enableSorting: false, header: ({ column }) => <DataTableColumnHeader column={column} className="pe-3 text-end" title="common.actions" />, cell: ({ row }) => (
      canEdit ? <div className="flex justify-end pe-3"><CategoryDialog row={row.original} /></div> : null
    ) },
  ];

  if (!canRead) return <p role="alert">{t("platform_support.errors.forbidden")}</p>;

  const title = t("help.management.categories");
  return (
    <>
      {categories.isError && <p role="alert">{t("help.error")}</p>}
      <DataTable columns={columns} data={rows} isLoading={categories.isLoading} isFetching={categories.isFetching}
        queryKey={CATEGORY_URL} toggleColumns toolbarTitle={rows.length ? `${title} (${rows.length})` : title}
        form={hasPermission("platform-help-admin.categories.create") ? CategoryDialog : undefined} />
    </>
  );
}
