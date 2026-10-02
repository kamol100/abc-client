import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { AgentFormSchema, AgentRow } from "@/components/agents/agent-type";
import AgentFormFieldSchema from "@/components/agents/agent-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<AgentRow> & { id?: string };
};

const createDefaults: Partial<AgentRow> = {
    commission: 0,
    status: "active",
};

const AgentForm: FC<Props> = ({
    mode = "create",
    api = "/agents",
    method = "POST",
    data,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "agent.create_title" : "agent.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={AgentFormFieldSchema()}
                grids={2}
                data={mode === "edit" ? data : { ...createDefaults, ...data }}
                api={api}
                mode={mode}
                schema={AgentFormSchema}
                method={method}
                queryKey="agents"
            />
        </MyDialog>
    );
};

export default AgentForm;
