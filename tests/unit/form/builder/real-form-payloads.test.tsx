/**
 * Payload snapshots for real forms.
 *
 * This is the main guard for the form builder refactor. For each form below it uses the
 * real field config and the real Zod schema, and records two things:
 *
 *   1. create: the values a new form starts with (field defaults, hidden-field resets).
 *   2. edit:   the request sent when a record is loaded from the API and saved unchanged.
 *
 * A refactor that only moves code must leave every snapshot the same. If a snapshot
 * changes, the form now sends something different to the API: stop and find out why.
 * Only update a snapshot (`vitest -u`) for a change that is meant to alter the payload.
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type {
    AccordionSection,
    FieldConfig,
    FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import { ClientFormFieldSchema } from "@/components/clients/client-form-schema";
import { ClientFormSchema } from "@/components/clients/client-type";
import { DeviceFormFieldSchema } from "@/components/device/device-form-schema";
import { DeviceFormSchema } from "@/components/device/device-type";
import { ExpenseFormFieldSchema } from "@/components/expenses/expense-form-schema";
import { ExpenseFormSchema } from "@/components/expenses/expense-type";
import { PackageFormFieldSchema } from "@/components/packages/package-form-schema";
import { PackageFormSchema } from "@/components/packages/package-type";
import { ResellerFormFieldSchema } from "@/components/resellers/reseller-form-schema";
import { getResellerFormSchema } from "@/components/resellers/reseller-type";
import { SalaryFormFieldSchema } from "@/components/salaries/salary-form-schema";
import { SalaryFormSchema } from "@/components/salaries/salary-type";
import { StaffFormSchema as StaffFormFieldSchema } from "@/components/staffs/staff-form-schema";
import { StaffFormSchema } from "@/components/staffs/staff-type";
import { TjBoxFormFieldSchema } from "@/components/tj-box/tj-box-form-schema";
import { TjBoxFormSchema } from "@/components/tj-box/tj-box-type";
import { UserFormSchema as UserFormFieldSchema } from "@/components/users/user-form-schema";
import { getUserFormSchema } from "@/components/users/user-type";
import { ZoneFormFieldSchema } from "@/components/zones/zone-form-schema";
import { ZoneFormSchema } from "@/components/zones/zone-type";
import { mockApi, renderWithClient, stubBrowserApis, writeRequests } from "./harness";

// Dates in a payload depend on the time zone. Pin it to the one the app is used in,
// before anything creates a Date.
vi.hoisted(() => {
    process.env.TZ = "Asia/Dhaka";
});

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({ hasPermission: () => true }),
}));

type Mode = "create" | "edit";
type Schema = FormFieldConfig[] | AccordionSection[];

type FormCase = {
    name: string;
    api: string;
    accordion?: boolean;
    /** The real field config. Called inside a component, because some factories use hooks. */
    fields: (mode: Mode) => Schema;
    zod: (mode: Mode) => z.ZodType;
    /** Values the generated sample record needs so the real Zod schema accepts it. */
    recordOverrides?: Record<string, unknown>;
};

const cases: FormCase[] = [
    {
        name: "zone",
        api: "/zones",
        fields: () => ZoneFormFieldSchema(),
        zod: () => ZoneFormSchema,
    },
    {
        name: "expense",
        api: "/expenses",
        fields: (mode) =>
            ExpenseFormFieldSchema({
                mode,
                fundAccess: {
                    canChooseFund: true,
                    assignedFundId: null,
                    assignedFundName: "",
                    lockFund: false,
                    blockSubmit: false,
                    showUnassignedWarning: false,
                },
            }),
        zod: () => ExpenseFormSchema,
    },
    {
        name: "tj-box",
        api: "/tj-boxes",
        fields: () => TjBoxFormFieldSchema(),
        zod: () => TjBoxFormSchema,
    },
    {
        name: "package",
        api: "/packages",
        fields: () => PackageFormFieldSchema(),
        zod: () => PackageFormSchema,
        recordOverrides: { mikrotik_profile: "10M-Profile" },
    },
    {
        name: "device",
        api: "/devices",
        fields: () => DeviceFormFieldSchema([1], false),
        zod: () => DeviceFormSchema,
        recordOverrides: { snmp_community: "public" },
    },
    {
        name: "user",
        api: "/users",
        fields: (mode) => UserFormFieldSchema({ mode }),
        zod: (mode) => getUserFormSchema(mode),
        recordOverrides: { email: "user@example.com", password: undefined, confirm: undefined },
    },
    {
        name: "salary",
        api: "/salaries",
        fields: () => SalaryFormFieldSchema(),
        zod: () => SalaryFormSchema,
    },
    {
        name: "client",
        api: "/clients",
        accordion: true,
        fields: (mode) => ClientFormFieldSchema({ mode }),
        zod: () => ClientFormSchema,
    },
    {
        name: "staff",
        api: "/staffs",
        accordion: true,
        fields: (mode) => StaffFormFieldSchema({ mode }),
        zod: () => StaffFormSchema,
    },
    {
        name: "reseller",
        api: "/resellers",
        accordion: true,
        fields: (mode) => ResellerFormFieldSchema({ mode }),
        zod: (mode) => getResellerFormSchema(mode),
        // The reseller Zod schema only accepts a string id.
        recordOverrides: { id: "5" },
    },
];

// --- A sample API record, built from the field config ---

const isSections = (schema: Schema): schema is AccordionSection[] =>
    schema.length > 0 && "form" in schema[0];

const flatten = (schema: Schema): FormFieldConfig[] =>
    isSections(schema) ? schema.flatMap((section) => section.form) : schema;

/**
 * One value per field, shaped the way the API returns it: related records as objects
 * under `valueKey`, dates as date-only strings. The same config always gives the same
 * record, so the snapshots are stable.
 */
function sampleRecord(fields: FormFieldConfig[], seed = 0): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    fields.forEach((field, position) => {
        const index = seed + position + 1;

        if (field.type === "slot") return;
        if (field.type === "fieldArray") {
            record[field.name] = [sampleRecord(field.itemFields, index * 100)];
            return;
        }
        Object.assign(record, sampleValue(field, index));
    });

    return record;
}

function sampleValue(field: FieldConfig, index: number): Record<string, unknown> {
    switch (field.type) {
        case "text":
        case "password":
        case "textarea":
            return { [field.name]: `${field.name} ${index}` };
        case "email":
            return { [field.name]: `user${index}@example.com` };
        case "tel":
            return { [field.name]: "01712345678" };
        case "number":
            return { [field.name]: index };
        case "switch":
            return { [field.name]: true };
        case "radio":
            return { [field.name]: field.options[0]?.value };
        case "checkbox":
            return { [field.name]: field.single ? true : [field.options?.[0]?.value] };
        case "date":
            return { [field.valueKey ?? field.name]: "2026-11-25" };
        case "dateRange":
            return { [field.valueKey ?? field.name]: { from: "2026-11-01", to: "2026-11-30" } };
        case "geolocation":
            return { [field.latitudeName]: "23.7808", [field.longitudeName]: "90.4219" };
        case "dropdown": {
            const id = field.options?.[0]?.value ?? 100 + index;
            const sourceKey = field.valueKey || field.name;
            const related = field.valueMapping
                ? { [field.valueMapping.idKey]: id, name: `${field.name} option` }
                : id;
            return { [sourceKey]: field.isMulti ? [related] : related };
        }
        default:
            return {};
    }
}

// --- Rendering ---

const anyValues = z.object({}).passthrough();

function RealForm({ formCase, mode, zod }: { formCase: FormCase; mode: Mode; zod: z.ZodType }) {
    const fields = formCase.fields(mode);
    const shared = {
        schema: zod,
        api: formCase.api,
        method: mode === "edit" ? ("PUT" as const) : ("POST" as const),
        mode,
        queryKey: formCase.name,
        grids: 2,
        data: mode === "edit" ? { id: 5 } : undefined,
    };

    return isSections(fields) ? (
        <AccordionFormBuilder formSchema={fields} {...shared} />
    ) : (
        <FormBuilder formSchema={fields} {...shared} />
    );
}

async function saveAndReadRequest() {
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "common.save" }));

    try {
        await waitFor(() => expect(writeRequests()).toHaveLength(1));
    } catch {
        const messages = Array.from(document.querySelectorAll("p.text-destructive")).map(
            (node) => node.textContent,
        );
        throw new Error(`The form did not submit. Validation messages on screen: ${JSON.stringify(messages)}`);
    }
    return writeRequests()[0];
}

describe("real form payloads", () => {
    beforeEach(() => {
        stubBrowserApis();
        // Some Zod schemas default a date to "today". Hold today still; timers stay real.
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-11-25T06:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe.each(cases)("$name", (formCase) => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «create: starting values»।
        it("Form request data: Create mode: initialize the expected request values", async () => {
            mockApi();
            renderWithClient(<RealForm formCase={formCase} mode="create" zod={anyValues} />);

            const request = await saveAndReadRequest();

            expect(request.url).toBe(formCase.api);
            expect(request.method).toBe("POST");
            expect(request.data).toMatchSnapshot();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «edit: loads the record and sends it back unchanged»।
        it("Form request data: edit: loads the record and sends it back unchanged", async () => {
            let record: Record<string, unknown> = {};
            function Probe() {
                // Build the sample record from the same field config the form uses.
                record = {
                    id: 5,
                    ...sampleRecord(flatten(formCase.fields("edit"))),
                    ...formCase.recordOverrides,
                };
                return null;
            }
            renderWithClient(<Probe />).unmount();

            mockApi((request) =>
                request.method === "GET" && request.url === `${formCase.api}/5`
                    ? { success: true, data: record }
                    : undefined,
            );
            renderWithClient(<RealForm formCase={formCase} mode="edit" zod={formCase.zod("edit")} />);

            const request = await saveAndReadRequest();

            expect(request.url).toBe(`${formCase.api}/5`);
            expect(request.method).toBe("PUT");
            expect({ record, payload: request.data }).toMatchSnapshot();
        });
    });
});
