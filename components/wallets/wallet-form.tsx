"use client";

import { useFetch } from "@/app/actions";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import InputField from "@/components/form/input-field";
import TextareaField from "@/components/form/textarea-field";
import SelectDropdown from "@/components/select-dropdown";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FC, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { parseApiError } from "@/lib/helper/helper";
import {
  ClientWalletRechargeFormInput,
  ClientWalletRechargeFormSchema,
  WalletRechargeFormInput,
  WalletRechargeFormSchema,
} from "./wallet-type";

const pad2 = (value: number): string => value.toString().padStart(2, "0");

export const BkashWalletForm: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const submitRef = useRef<HTMLInputElement>(null);

  const form = useForm<WalletRechargeFormInput>({
    resolver: zodResolver(WalletRechargeFormSchema),
    mode: "onChange",
    defaultValues: { balance: 0 },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (payload: WalletRechargeFormInput) => {
      const now = new Date();
      const pid = Date.now();
      const invoice = `RC-${pad2(now.getHours())}${pad2(now.getMinutes())}`;
      const host = window.location.hostname;
      const origin = window.location.origin;

      const result = await useFetch({
        url: "/bkash-balance-recharge/create",
        method: "POST",
        data: {
          ...payload,
          amount: payload.balance,
          pid,
          invoice,
          host,
          callback: `${origin}/my-wallets?pid=${pid}`,
        },
      });

      if (!result?.success) {
        throw result;
      }

      return result?.data as { bkashURL?: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      if (data?.bkashURL) {
        window.location.href = data.bkashURL;
        return;
      }
      toast.success(t("wallet.messages.redirecting_to_payment"));
      router.replace("/my-wallets");
    },
    onError: (error) => {
      toast.error(t(String(parseApiError(error) || "wallet.messages.recharge_failed")));
    },
  });

  return (
    <MyDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset({ balance: 0 });
        }
      }}
      size="md"
      title="wallet.recharge_title"
      trigger={
        <MyButton size="default" variant="default">
          {t("wallet.recharge_with_bkash")}
        </MyButton>
      }
      footer={({ close }) => (
        <>
          <MyButton type="button" variant="outline" onClick={close}>
            {t("common.cancel")}
          </MyButton>
          <MyButton
            type="button"
            variant="default"
            onClick={() => submitRef.current?.click()}
            loading={rechargeMutation.isPending}
          >
            {t("wallet.pay_with_bkash")}
          </MyButton>
        </>
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => rechargeMutation.mutate(values))}>
          <InputField
            name="balance"
            type="number"
            label={{ labelText: "wallet.amount.label", mandatory: true }}
            placeholder="wallet.amount.placeholder"
          />
          <input ref={submitRef} type="submit" className="hidden" />
        </form>
      </Form>
    </MyDialog>
  );
};

export const ClientWalletForm: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const submitRef = useRef<HTMLInputElement>(null);

  const defaultValues = useMemo<ClientWalletRechargeFormInput>(
    () => ({
      client_id: undefined,
      balance: 0,
      note: "",
    }),
    []
  );

  const form = useForm<ClientWalletRechargeFormInput>({
    resolver: zodResolver(ClientWalletRechargeFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const rechargeMutation = useMutation({
    mutationFn: async (payload: ClientWalletRechargeFormInput) => {
      const result = await useFetch({
        url: "/client-wallet-recharge",
        method: "POST",
        data: payload,
      });
      if (!result?.success) {
        throw result;
      }
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-wallets"] });
      toast.success(t("wallet.messages.client_recharge_success"));
      setOpen(false);
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast.error(
        t(String(parseApiError(error) || "wallet.messages.client_recharge_failed"))
      );
    },
  });

  return (
    <MyDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset(defaultValues);
        }
      }}
      size="md"
      title="wallet.client_recharge_title"
      trigger={
        <MyButton action="create" size="default" variant="default" title={t("common.add")} />
      }
      footer={({ close }) => (
        <>
          <MyButton type="button" variant="outline" onClick={close}>
            {t("common.cancel")}
          </MyButton>
          <MyButton
            type="button"
            variant="default"
            onClick={() => submitRef.current?.click()}
            loading={rechargeMutation.isPending}
          >
            {t("common.save")}
          </MyButton>
        </>
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => rechargeMutation.mutate(values))}>
          <div className="space-y-4">
            <SelectDropdown
              name="client_id"
              label={{ labelText: "wallet.client.label", mandatory: true }}
              placeholder="wallet.client.placeholder"
              api="/dropdown-clients"
              isClearable={false}
            />
            <InputField
              name="balance"
              type="number"
              label={{ labelText: "wallet.amount.label", mandatory: true }}
              placeholder="wallet.amount.placeholder"
            />
            <TextareaField
              name="note"
              rows={2}
              label={{ labelText: "wallet.note.label" }}
              placeholder="wallet.note.placeholder"
            />
          </div>
          <input ref={submitRef} type="submit" className="hidden" />
        </form>
      </Form>
    </MyDialog>
  );
};
