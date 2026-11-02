"use client";

import { format, parseISO } from "date-fns";
import { Briefcase, Camera, Loader2, MapPin, Phone, Save, User, X } from "lucide-react";
import { ChangeEvent, DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/card";
import { MyDialog } from "@/components/my-dialog";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { staffProfileAvatarSrc } from "@/components/profiles/profile-avatar";
import {
  parseStaffAccount,
  type MobileSearchSetting,
  type StaffAccount,
  type UserAccountSettings,
} from "@/components/profiles/staff-account-type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { privateImageFileError } from "@/lib/images/private-image";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/app";

type PhotoResult = {
  field: string;
  value: string | null;
};

const GENDER_LABELS: Record<string, string> = {
  male: "common.male",
  female: "common.female",
};

export default function StaffAccountPage() {
  const { t } = useTranslation();
  const { profile, updateProfile } = useProfile();
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const { data, isLoading, isError } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["staff-account"],
    url: "staff-account",
    pagination: false,
  });
  const account = parseStaffAccount(data?.data);
  const [photoOverride, setPhotoOverride] = useState<string | null | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const storedPhoto = account?.photo ?? null;
  const photo = photoOverride === undefined ? storedPhoto : photoOverride;

  useEffect(() => {
    if (!account || nameTouched) return;
    setNameDraft(account.name ?? "");
  }, [account, nameTouched]);

  useEffect(() => {
    if (photoOverride !== undefined && photoOverride === storedPhoto) {
      setPhotoOverride(undefined);
    }
  }, [photoOverride, storedPhoto]);

  const syncProfile = (next: { name?: string | null; photo?: string | null; id: string }) => {
    const current = profileRef.current;
    const staff = {
      ...(current.staff ?? {}),
      id: next.id,
      ...(next.name !== undefined ? { name: next.name ?? undefined } : {}),
      ...(next.photo !== undefined ? { photo: next.photo } : {}),
    };
    const partial: Partial<Profile> = { staff };
    if (next.name !== undefined) partial.name = next.name ?? "";
    updateProfile(partial);
  };

  const applyPhoto = (value: string | null) => {
    const next = value && value.trim() !== "" ? value : null;
    setPhotoOverride(next);
    if (account) syncProfile({ id: account.id, photo: next });
  };

  const upload = useApiMutation<PhotoResult, FormData>({
    url: "/staff-photo",
    method: "POST",
    invalidateKeys: "staff-account",
    successMessage: "staff_account.upload_success",
    defaultErrorMessage: "staff_account.upload_failed",
    onSuccess: (result) => applyPhoto(result?.value ?? null),
  });

  const remove = useApiMutation<PhotoResult>({
    url: "/staff-photo",
    method: "DELETE",
    invalidateKeys: "staff-account",
    successMessage: "staff_account.remove_success",
    defaultErrorMessage: "staff_account.remove_failed",
    onSuccess: () => applyPhoto(null),
  });

  const saveName = useApiMutation<unknown, { name: string }>({
    url: "/staff-account",
    method: "PUT",
    invalidateKeys: "staff-account",
    successMessage: "staff_account.name_success",
    defaultErrorMessage: "staff_account.name_failed",
    onSuccess: (result) => {
      const next = parseStaffAccount(result);
      setNameTouched(false);
      setNameDraft(next?.name ?? nameDraft.trim());
      if (next) syncProfile({ id: next.id, name: next.name });
    },
  });

  const saveSettings = useApiMutation<unknown, Pick<UserAccountSettings, "mobile_search">>({
    url: "/staff-account/settings",
    method: "PUT",
    invalidateKeys: "staff-account",
    successMessage: "staff_account.settings.saved",
    defaultErrorMessage: "staff_account.settings.failed",
  });

  const busy = upload.isPending || remove.isPending;
  const busyRef = useRef(false);

  const selectFile = async (file: File | null) => {
    if (!file || busyRef.current || busy) return;
    const errorKey = privateImageFileError(file);
    if (errorKey) {
      toast.error(t(`staff.images.${errorKey}`));
      return;
    }

    busyRef.current = true;
    const body = new FormData();
    body.append("file", file);
    try {
      await upload.mutateAsync(body);
    } catch {
      // The mutation already shows the error toast.
    } finally {
      busyRef.current = false;
    }
  };

  const submitName = async (): Promise<boolean> => {
    const name = nameDraft.trim();
    if (name.length < 2) {
      toast.error(t("staff_account.name_min"));
      return false;
    }
    if (!account || name === (account.name ?? "")) return true;
    try {
      await saveName.mutateAsync({ name });
      return true;
    } catch {
      return false;
    }
  };

  const submitSettings = async (mobileSearch: MobileSearchSetting): Promise<boolean> => {
    try {
      await saveSettings.mutateAsync({ mobile_search: mobileSearch });
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return <StaffAccountSkeleton />;
  }

  if (isError || !account) {
    return (
      <Card>
        <p className="p-4 text-sm text-destructive" role="alert">
          {t(isError ? "common.failed_to_load_data" : "staff_account.missing")}
        </p>
      </Card>
    );
  }

  return (
    <>
      <StaffAccountView
        account={account}
        photo={photo}
        nameDraft={nameDraft}
        busy={busy}
        savingName={saveName.isPending}
        onNameChange={(value) => {
          setNameTouched(true);
          setNameDraft(value);
        }}
        onSaveName={submitName}
        onCancelName={() => {
          setNameTouched(false);
          setNameDraft(account.name ?? "");
        }}
        onSelectFile={(file) => {
          void selectFile(file);
        }}
        onRemove={() => setConfirmOpen(true)}
        savingSettings={saveSettings.isPending}
        onSaveSettings={submitSettings}
      />
      <MyDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="staff_account.remove_title"
        description="staff_account.remove_confirm"
        variant="destructive"
        size="sm"
        confirmText="staff_account.remove_photo"
        loading={remove.isPending}
        onConfirm={async () => {
          await remove.mutateAsync();
        }}
      />
    </>
  );
}

export function StaffAccountView({
  account,
  photo,
  nameDraft,
  busy,
  savingName,
  onNameChange,
  onSaveName,
  onCancelName,
  onSelectFile,
  onRemove,
  savingSettings,
  onSaveSettings,
}: {
  account: StaffAccount;
  photo: string | null;
  nameDraft: string;
  busy: boolean;
  savingName: boolean;
  onNameChange: (value: string) => void;
  onSaveName: () => Promise<boolean>;
  onCancelName: () => void;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
  savingSettings: boolean;
  onSaveSettings: (mobileSearch: MobileSearchSetting) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [broken, setBroken] = useState(false);
  const avatar = staffProfileAvatarSrc({ id: account.id, photo });
  const showPhoto = Boolean(avatar) && !broken;
  const displayName = account.name ?? "";

  useEffect(() => {
    if (!editingName) return;
    nameInputRef.current?.focus();
  }, [editingName]);

  useEffect(() => {
    setBroken(false);
  }, [photo]);

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) onSelectFile(file);
    event.target.value = "";
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (busy) return;
    setDragging(true);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  };

  const mapped = (value: string | null, labels: Record<string, string>) => {
    if (!value) return null;
    const key = labels[value];
    return key ? t(key) : value;
  };

  const roles = account.roles.length > 0 ? account.roles.join(", ") : null;
  const address = account.present_address
    ? { label: t("staff.present_address.label"), value: account.present_address }
    : account.permanent_address
      ? { label: t("staff.permanent_address.label"), value: account.permanent_address }
      : null;

  return (
    <div className="space-y-4 pr-3">
      <Card>
        <section className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-6">
          <div
            className={cn(
              "relative w-fit shrink-0 rounded-full",
              dragging && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            onDragEnter={onDragOver}
            onDragOver={onDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <Avatar className="h-24 w-24 border border-border">
              {showPhoto ? (
                <AvatarImage src={avatar} alt={displayName} onError={() => setBroken(true)} />
              ) : null}
              <AvatarFallback
                className="bg-muted text-muted-foreground"
                aria-label={t("staff_account.dummy_photo")}
              >
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <MyButton
              type="button"
              size="icon"
              icon={false}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              aria-label={t("staff_account.change_photo")}
              onClick={openPicker}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : <Camera />}
            </MyButton>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label={t("staff_account.photo_input")}
              onChange={onFileChange}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <AccountStatus status={account.status} />
            </div>
            {editingName ? (
              <form
                className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onSaveName().then((saved) => {
                    if (saved) setEditingName(false);
                  });
                }}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <label htmlFor="staff-account-name" className="sr-only">
                    {t("staff.name.label")}
                  </label>
                  <Input
                    ref={nameInputRef}
                    id="staff-account-name"
                    value={nameDraft}
                    onChange={(event) => onNameChange(event.target.value)}
                    disabled={savingName}
                  />
                </div>
                <div className="flex gap-2">
                  <MyButton
                    type="submit"
                    action="save"
                    loading={savingName}
                    disabled={savingName}
                    aria-label={t("staff_account.save_name")}
                  >
                    <Save />
                  </MyButton>
                  <MyButton
                    type="button"
                    action="cancel"
                    variant="outline"
                    disabled={savingName}
                    aria-label={t("common.cancel")}
                    onClick={() => {
                      onCancelName();
                      setEditingName(false);
                    }}
                  >
                    <X />
                  </MyButton>
                </div>
              </form>
            ) : (
              <div className="flex min-w-0 items-center gap-1">
                <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {displayName || "—"}
                </h1>
                <MyButton
                  type="button"
                  action="edit"
                  size="icon"
                  icon
                  aria-label={t("staff_account.edit_name")}
                  onClick={() => {
                    onNameChange(displayName);
                    setEditingName(true);
                  }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">{t("staff.images.photo.hint")}</p>
            <div className="flex flex-wrap gap-2">
              <MyButton type="button" icon={false} onClick={openPicker} disabled={busy}>
                <Camera />
                {t("staff_account.change_photo")}
              </MyButton>
              {photo ? (
                <MyButton type="button" icon={false} variant="outline" onClick={onRemove} disabled={busy}>
                  {t("staff_account.remove_photo")}
                </MyButton>
              ) : null}
            </div>
          </div>
        </section>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <Card>
          <section>
            <CardHeading title={t("staff_account.account_information")} />
            <div className="divide-y divide-border">
              <InfoCategory title={t("staff_account.sections.personal")} icon={User}>
                <InfoItem label={t("staff.gender.label")} value={mapped(account.gender, GENDER_LABELS)} />
                <InfoItem label={t("staff_account.blood_group")} value={account.blood_group} />
                <InfoItem
                  label={t("staff.date_of_birth.label")}
                  value={formatAccountDate(account.date_of_birth)}
                />
              </InfoCategory>
              <InfoCategory title={t("staff_account.sections.contact")} icon={Phone}>
                <InfoItem label={t("staff.phone.label")} value={account.phone} />
                <InfoItem label={t("staff.email.label")} value={account.email} />
              </InfoCategory>
              {address ? (
                <InfoCategory title={t("staff_account.sections.address")} icon={MapPin}>
                  <InfoItem label={address.label} value={address.value} />
                </InfoCategory>
              ) : null}
              <InfoCategory title={t("staff_account.sections.work")} icon={Briefcase}>
                <InfoItem label={t("staff.designation.label")} value={account.designation} />
                <InfoItem label={t("staff.username.label")} value={account.username} />
                <InfoItem label={t("staff.roles.label")} value={roles} />
                <InfoItem label={t("staff.join_date.label")} value={formatAccountDate(account.join_date)} />
              </InfoCategory>
            </div>
          </section>
        </Card>

        <Card>
          <section aria-busy={savingSettings}>
            <CardHeading title={t("staff_account.account_settings")} />
            <MobileSearchFields
              value={account.settings.mobile_search}
              saving={savingSettings}
              onSave={onSaveSettings}
            />
          </section>
        </Card>
      </div>
    </div>
  );
}

const SEARCH_MODES = ["simple", "default"] as const;

function MobileSearchFields({
  value,
  saving,
  onSave,
}: {
  value: MobileSearchSetting;
  saving: boolean;
  onSave: (next: MobileSearchSetting) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const savedMode = value.mode;
  const savedOpen = value.always_open;
  const [search, setSearch] = useState(value);

  useEffect(() => {
    setSearch({ mode: savedMode, always_open: savedOpen });
  }, [savedMode, savedOpen]);

  const commit = async (next: MobileSearchSetting) => {
    if (saving || (next.mode === search.mode && next.always_open === search.always_open)) return;
    const previous = search;
    setSearch(next);
    const saved = await onSave(next);
    if (!saved) setSearch(previous);
  };

  return (
    <div className={cn("divide-y divide-border", saving && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <span className="text-sm text-foreground">
          {t("staff_account.mobile_search.title")}
          <span className="px-2 text-muted-foreground" aria-hidden>
            :
          </span>
        </span>
        <RadioGroup
          value={search.mode}
          disabled={saving}
          aria-label={t("staff_account.mobile_search.mode_label")}
          className="flex flex-row flex-wrap gap-x-4 gap-y-2"
          onValueChange={(mode) => {
            if (mode === "simple" || mode === "default") {
              void commit({ mode, always_open: search.always_open });
            }
          }}
        >
          {SEARCH_MODES.map((mode) => (
            <label
              key={mode}
              htmlFor={`staff-mobile-search-${mode}`}
              className={cn("flex cursor-pointer items-center gap-2 text-sm text-foreground", saving && "cursor-not-allowed")}
            >
              <RadioGroupItem
                id={`staff-mobile-search-${mode}`}
                value={mode}
                disabled={saving}
                aria-label={t(`staff_account.mobile_search.${mode}`)}
              />
              {t(`staff_account.mobile_search.${mode}`)}
            </label>
          ))}
        </RadioGroup>
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Label htmlFor="staff-mobile-search-open" className="text-sm font-normal text-foreground">
          {t("staff_account.mobile_search.always_open")}
        </Label>
        <Switch
          id="staff-mobile-search-open"
          checked={search.always_open}
          disabled={saving}
          aria-label={t("staff_account.mobile_search.always_open")}
          onCheckedChange={(alwaysOpen) => {
            void commit({ mode: search.mode, always_open: alwaysOpen });
          }}
        />
      </div>
    </div>
  );
}

function CardHeading({ title }: { title: string }) {
  return (
    <div className="border-b border-border bg-muted/40 px-4 py-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function InfoCategory({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  const trimmed = value?.trim();
  return (
    <div className="grid grid-cols-[minmax(7rem,9rem)_1fr] items-start gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-foreground">
        {trimmed ? trimmed : <span className="font-normal text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

function AccountStatus({ status }: { status: string | null }) {
  const { t } = useTranslation();
  if (status === "active") {
    return (
      <MyBadge type="success" variant="soft" size="sm" icon={User}>
        {t("common.active")}
      </MyBadge>
    );
  }
  if (status === "inactive") {
    return (
      <MyBadge type="error" variant="soft" size="sm" icon={User}>
        {t("common.inactive")}
      </MyBadge>
    );
  }

  return null;
}

function StaffAccountSkeleton() {
  return (
    <div className="space-y-4 pr-3" aria-busy="true">
      <Card>
        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-full max-w-sm" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index}>
            <div className="border-b border-border px-4 py-3">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatAccountDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, "dd MMM yyyy");
}
