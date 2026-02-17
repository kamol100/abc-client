"use client";

import { FC } from "react";
import { DialogWrapper } from "../dialog";
import FormBuilder from "../form-wrapper/form-builder";
import { AddPlus, EditIcon } from "../icon";
import { getUserFormSchema, UserRow } from "./user-type";
import UserFormSchema from "./user-form-schema";
import { Button } from "../ui/button";
import ActionButton from "../action-button";

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
            trigger={
                mode === "create" ? (
                    <Button>
                        <AddPlus /> Add
                    </Button>
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
