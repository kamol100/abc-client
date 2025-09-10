"use client";
import { FC } from "react";
import { DialogWrapper } from "../dialog";
import FormWrapper from "../form-wrapper/form-wrapper";
import { AddPlus } from "../icon";
import InputField from "../input-field";
import { UserSchema } from "../schema/user";
import SelectDropdown from "../select-dropdown";

type props = {
  mode?: string;
  api?: string;
  method?: string;
  data?: any;
};

const UserForm: FC<props> = ({
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
      <FormWrapper
        schema={UserSchema}
        api={api}
        method={method}
        mode={mode}
        queryKey="users"
        data={data}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          <InputField
            labelText="name"
            mandatory
            name="name"
            placeholder="name"
          />
          <InputField
            labelText="Username"
            mandatory
            name="username"
            placeholder="Username"
          />
          <InputField
            labelText="email"
            inputType="email"
            name="email"
            placeholder="email"
          />
          <div>
            <SelectDropdown
              name="status"
              options={[
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
              ]}
            />
          </div>
          {mode === "create" && (
            <>
              <InputField
                labelText="password"
                name="password"
                inputType="password"
                placeholder="password"
              />
              <InputField
                labelText="confirm_password"
                name="confirm"
                inputType="password"
                placeholder="confirm password"
              />
            </>
          )}
        </div>
      </FormWrapper>
    </DialogWrapper>
  );
};

export default UserForm;
