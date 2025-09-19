import { z } from "zod";
// export const dashBoardSetting = z.object({
//     settings: z
//         .object({
//             show_dashboard_header: z.nullable(z.any()).optional(),
//             sms_api: z.nullable(z.string()).optional(),
//             sms_api_password: z.nullable(z.string()).optional(),
//         })
//         .optional(),
// });
// export type DashboardSettingSchema = z.infer<typeof dashBoardSetting>;
export const settings = z.object({
    show_dashboard_header: z.nullable(z.boolean()).optional(),
    show_table_header: z.nullable(z.boolean()).optional(),
});
export type SettingSchema = z.infer<typeof settings>;