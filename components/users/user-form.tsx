"use client";

import { FC } from "react";
import { DialogWrapper } from "../dialog";
import FormBuilder from "../form-wrapper/form-builder";
import { AddPlus } from "../icon";
import { getUserFormSchema, UserRow } from "./user-type";
import UserFormSchema from "./user-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: UserRow;
};

const UserForm: FC<Props> = ({
    mode = "create",
    api = "/users",
    method = "POST",
    data = undefined,
}) => {
    return (
        <DialogWrapper
            title={mode === "create" ? "create_user" : "edit_user"}
            trigger={mode === "create" ? "Add" : "Edit"}
            Icon={AddPlus}
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
