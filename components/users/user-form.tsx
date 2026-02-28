"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { AddPlus } from "@/components/icon";
import { getUserFormSchema, UserRow } from "@/components/users/user-type";
import UserFormSchema from "@/components/users/user-form-schema";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/action-button";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<UserRow> & { id: number };
};

const UserForm: FC<Props> = ({
    mode = "create",
    api = "/users",
    method = "POST",
    data = undefined,
}) => {
    return (
        <DialogWrapper
            size="xl"
            title={mode === "create" ? "create_user" : "edit_user"}
            trigger={
                mode === "create" ? (
                    <ActionButton action="create" size={"default"} variant="default" title="add">
                    </ActionButton>
                ) : (
                    <ActionButton
                        action="edit"
                        icon={true}
                    />
                )
            }
        >
            <FormBuilder
                formSchema={UserFormSchema({ mode })}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={getUserFormSchema(mode)}
                method={method}
                queryKey="users"
            />
        </DialogWrapper>
    );
};

export default UserForm;
