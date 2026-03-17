"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { getUserFormSchema, UserRow } from "@/components/users/user-type";
import UserFormSchema from "@/components/users/user-form-schema";
import FormTrigger from "@/components/form-trigger";

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
            title={mode === "create" ? "user.create_title" : "user.edit_title"}
            trigger={<FormTrigger mode={mode} />}
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
