"use client";

import { Form } from "@/components/ui/form";
import ActionButton from "@/components/action-button";
import Card from "@/components/card";
import Label from "@/components/label";
import SelectDropdown from "@/components/select-dropdown";
import useApiMutation from "@/hooks/use-api-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

const ImportClientSyncSchema = z.object({
    network_id: z.coerce
        .number({
            required_error: "import_client.sync.network.errors.required",
        })
        .min(1, { message: "import_client.sync.network.errors.required" }),
});

type ImportClientSyncInput = z.infer<typeof ImportClientSyncSchema>;

export default function ImportClientSyncForm() {
    const { t } = useTranslation();
    const form = useForm<ImportClientSyncInput>({
        resolver: zodResolver(ImportClientSyncSchema),
        mode: "onSubmit",
    });

    const { mutate, isPending } = useApiMutation<
        unknown,
        ImportClientSyncInput
    >({
        url: "/mikrotik-sync",
        method: "POST",
        invalidateKeys: "sync-clients",
        onSuccess: () => {
            form.reset();
            toast.success(t("import_client.messages.sync_success"));
        },
    });

    return (
        <Card className="mb-3 p-3">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((values) => mutate(values))}
                    className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                    <div>
                        <Label
                            label={{
                                labelText: "import_client.sync.network.label",
                                mandatory: true,
                            }}
                        />
                        <SelectDropdown
                            name="network_id"
                            api="/dropdown-networks"
                            placeholder="import_client.sync.network.placeholder"
                        />
                    </div>
                    <ActionButton
                        action="save"
                        type="submit"
                        loading={isPending}
                        title={t("import_client.sync.button")}
                        className="w-full sm:w-auto"
                    />
                </form>
            </Form>
        </Card>
    );
}
