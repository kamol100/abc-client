"use client";

import { ChangeEvent, DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Camera, Loader2, MapPin, Phone, User, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/card";
import { MyDialog } from "@/components/my-dialog";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { clientProfileAvatarSrc } from "@/components/profiles/profile-avatar";
import { getClientTerminationDateDisplay } from "@/components/clients/client-termination-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { privateImageFileError } from "@/lib/images/private-image";
import { cn } from "@/lib/utils";
import {
  parseClientAccount,
  type ClientAccount,
} from "@/components/client-area/client-account-type";

type PhotoResult = {
  field: string;
  value: string | null;
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
  "1": "client.type.home",
  "2": "client.type.corporate",
  "3": "client.type.others",
};

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  "1": "client.connection_type.shared",
  "2": "client.connection_type.dedicated",
};

const CABLE_TYPE_LABELS: Record<string, string> = {
  UTP: "client.cable_type.options.utp",
  FIBER: "client.cable_type.options.fiber",
};

const BILLING_TERM_LABELS: Record<string, string> = {
  prepaid: "common.prepaid",
  postpaid: "common.postpaid",
};

const BILLING_TYPE_LABELS: Record<string, string> = {
  auto: "common.auto",
  manual: "common.manual",
  no_bill: "common.no_bill",
};

export default function ClientAccountPage() {
  const { t } = useTranslation();
  const { updateProfile } = useProfile();
  const { data, isLoading, isError } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["client-account"],
    url: "client-account",
    pagination: false,
  });
  const account = parseClientAccount(data?.data);
  const [photoOverride, setPhotoOverride] = useState<string | null | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const storedPhoto = account?.photo ?? null;
  const photo = photoOverride === undefined ? storedPhoto : photoOverride;

  useEffect(() => {
    if (photoOverride !== undefined && photoOverride === storedPhoto) {
      setPhotoOverride(undefined);
    }
  }, [photoOverride, storedPhoto]);

  const applyPhoto = (value: string | null) => {
    const next = value && value.trim() !== "" ? value : null;
    setPhotoOverride(next);
    updateProfile({ photo: next });
  };

  const upload = useApiMutation<PhotoResult, FormData>({
    url: "/client-photo",
    method: "POST",
    invalidateKeys: "client-account,client-profile",
    successMessage: "client_account.upload_success",
    defaultErrorMessage: "client_account.upload_failed",
    onSuccess: (result) => applyPhoto(result?.value ?? null),
  });

  const remove = useApiMutation<PhotoResult>({
    url: "/client-photo",
    method: "DELETE",
    invalidateKeys: "client-account,client-profile",
    successMessage: "client_account.remove_success",
    defaultErrorMessage: "client_account.remove_failed",
    onSuccess: () => applyPhoto(null),
  });

  const busy = upload.isPending || remove.isPending;
  const busyRef = useRef(false);

  const selectFile = async (file: File | null) => {
    if (!file || busyRef.current || busy) return;
    const errorKey = privateImageFileError(file);
    if (errorKey) {
      toast.error(t(`client.images.${errorKey}`));
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

  if (isLoading) {
    return <ClientAccountSkeleton />;
  }

  if (isError || !account) {
    return (
      <Card>
        <p className="p-4 text-sm text-destructive" role="alert">
          {t("common.failed_to_load_data")}
        </p>
      </Card>
    );
  }

  return (
    <>
      <ClientAccountView
        account={account}
        photo={photo}
        busy={busy}
        onSelectFile={(file) => {
          void selectFile(file);
        }}
        onRemove={() => setConfirmOpen(true)}
      />
      <MyDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="client_account.remove_title"
        description="client_account.remove_confirm"
        variant="destructive"
        size="sm"
        confirmText="client_account.remove_photo"
        loading={remove.isPending}
        onConfirm={async () => {
          await remove.mutateAsync();
        }}
      />
    </>
  );
}

export function ClientAccountView({
  account,
  photo,
  busy,
  onSelectFile,
  onRemove,
}: {
  account: ClientAccount;
  photo: string | null;
  busy: boolean;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [broken, setBroken] = useState(false);
  const avatar = clientProfileAvatarSrc(photo);
  const name = account.name ?? "";
  const showPhoto = Boolean(avatar) && !broken;

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

  const meta = [account.customer_id, account.username].filter(Boolean).join(" · ");

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
                <AvatarImage src={avatar} alt={name} onError={() => setBroken(true)} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                {name ? initials(name) : "?"}
              </AvatarFallback>
            </Avatar>
            <MyButton
              type="button"
              size="icon"
              icon={false}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              aria-label={t("client_account.change_photo")}
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
              aria-label={t("client_account.photo_input")}
              onChange={onFileChange}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                {name || "—"}
              </h1>
              <AccountStatus status={account.status} />
            </div>
            {meta ? <p className="truncate text-sm text-muted-foreground">{meta}</p> : null}
            <p className="max-w-xl text-sm text-muted-foreground">{t("client_account.subtitle")}</p>
            <p className="text-xs text-muted-foreground">{t("client.images.photo.hint")}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <MyButton type="button" icon={false} onClick={openPicker} disabled={busy}>
                <Camera />
                {t("client_account.change_photo")}
              </MyButton>
              {photo ? (
                <MyButton type="button" icon={false} variant="outline" onClick={onRemove} disabled={busy}>
                  {t("client_account.remove_photo")}
                </MyButton>
              ) : null}
            </div>
          </div>
        </section>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AccountSection title={t("client_account.sections.personal")} icon={User}>
          <InfoItem label={t("client_dashboard.info.name")} value={account.name} />
          <InfoItem label={t("client.father_name.label")} value={account.father_name} />
          <InfoItem label={t("client.occupation.label")} value={account.occupation} />
          <InfoItem label={t("client_account.nid")} value={account.nid} />
        </AccountSection>
        <AccountSection title={t("client_account.sections.contact")} icon={Phone}>
          <InfoItem label={t("client_dashboard.info.phone")} value={account.phone} />
          <InfoItem label={t("client_dashboard.info.alternate_phone")} value={account.alternate_phone} />
          <InfoItem label={t("client.email.label")} value={account.email} />
        </AccountSection>
        <AccountSection title={t("client_account.sections.address")} icon={MapPin}>
          <InfoItem label={t("client.current_address.label")} value={account.current_address} />
          <InfoItem label={t("client.permanent_address.label")} value={account.permanent_address} />
          <InfoItem label={t("client.upazila.label")} value={account.upazila} />
          <InfoItem label={t("client.latitude.label")} value={account.latitude} />
          <InfoItem label={t("client.longitude.label")} value={account.longitude} />
        </AccountSection>
        <AccountSection title={t("client_account.sections.service")} icon={Wifi}>
          <InfoItem label={t("client_dashboard.info.customer_id")} value={account.customer_id} />
          <InfoItem label={t("client_dashboard.info.username")} value={account.username} className="font-mono" />
          <InfoItem label={t("client_dashboard.info.package")} value={account.package?.name ?? null} />
          <InfoItem label={t("common.bandwidth")} value={account.package?.bandwidth ?? null} />
          <InfoItem label={t("client.zone.label")} value={account.zone} />
          <InfoItem label={t("client.sub_zone.label")} value={account.sub_zone} />
          <InfoItem label={t("client.type.label")} value={mapped(account.type, CLIENT_TYPE_LABELS)} />
          <InfoItem
            label={t("client.connection_type.label")}
            value={mapped(account.connection_type, CONNECTION_TYPE_LABELS)}
          />
          <InfoItem
            label={t("client.cable_type.label")}
            value={mapped(account.cable_type, CABLE_TYPE_LABELS)}
          />
          <InfoItem label={t("client.cable_length.label")} value={account.cable_length} />
          <InfoItem label={t("client.mac_address.label")} value={account.mac_address} className="font-mono" />
          <InfoItem label={t("client.ip_address.label")} value={account.ip_address} className="font-mono" />
          <InfoItem label={t("client.connection_date.label")} value={formatAccountDate(account.connection_date)} />
          <InfoItem label={t("client.termination_date.label")}>
            <TerminationDate value={account.termination_date} />
          </InfoItem>
          <InfoItem
            label={t("client.billing_term.label")}
            value={mapped(account.billing_term, BILLING_TERM_LABELS)}
          />
          <InfoItem
            label={t("client.billing_type.label")}
            value={mapped(account.billing_type, BILLING_TYPE_LABELS)}
          />
          <InfoItem label={t("client.payment_term.label")} value={account.payment_term} />
        </AccountSection>
      </div>
    </div>
  );
}

function AccountSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: ReactNode;
}) {
  return (
    <Card>
      <section className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
      </section>
    </Card>
  );
}

function InfoItem({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value?: string | null;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-foreground">
        {children ?? <InfoText value={value ?? null} className={className} />}
      </dd>
    </div>
  );
}

function InfoText({ value, className }: { value: string | null; className?: string }) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return <span className="font-normal text-muted-foreground">—</span>;
  }

  return <span className={cn("break-words", className)}>{trimmed}</span>;
}

function AccountStatus({ status }: { status: number | null }) {
  const { t } = useTranslation();
  if (status === 1) {
    return (
      <MyBadge type="success" variant="soft" size="sm" icon={User}>
        {t("common.active")}
      </MyBadge>
    );
  }
  if (status === 0) {
    return (
      <MyBadge type="error" variant="soft" size="sm" icon={User}>
        {t("common.inactive")}
      </MyBadge>
    );
  }

  return <span className="font-normal text-muted-foreground">—</span>;
}

function TerminationDate({ value }: { value: string | null }) {
  const display = getClientTerminationDateDisplay(value);
  if (!display) return <InfoText value={null} />;
  if (display.kind === "unparsed") return <InfoText value={display.text} />;

  return (
    <span className={display.kind === "expired" ? "text-destructive" : "text-primary"}>
      {display.date}
    </span>
  );
}

function ClientAccountSkeleton() {
  return (
    <div className="space-y-4 pr-3" aria-busy="true">
      <Card>
        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <div className="space-y-4 p-4 sm:p-6">
              <Skeleton className="h-5 w-28" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatAccountDate(value: string | null): string | null {
  const display = getClientTerminationDateDisplay(value);
  if (!display) return null;
  if (display.kind === "unparsed") return display.text;
  return display.date;
}
