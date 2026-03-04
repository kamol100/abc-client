"use client";

import { Switch } from "@/components/ui/switch";
import useApiMutation from "@/hooks/use-api-mutation";
import { FC, useState } from "react";

interface ClientStatusToggleProps {
    clientId: number;
    initialStatus: 0 | 1;
}

const ClientStatusToggle: FC<ClientStatusToggleProps> = ({
    clientId,
    initialStatus,
}) => {
    const [status, setStatus] = useState(initialStatus);

    const { mutate, isPending } = useApiMutation<unknown, { status: 0 | 1 }>({
        url: `/client-status/${clientId}`,
        method: "PUT",
        invalidateKeys: "clients",
        successMessage: "client.status_updated",
        onSuccess: () => setStatus((prev) => (prev === 1 ? 0 : 1)),
    });

    return (
        <Switch
            checked={status === 1}
            onCheckedChange={() => mutate({ status: status === 1 ? 0 : 1 })}
            disabled={isPending}
        />
    );
};

export default ClientStatusToggle;
