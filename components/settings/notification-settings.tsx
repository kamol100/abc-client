"use client";

import {
    eventsForCategory,
    isNotificationSettingEnabled,
    NOTIFICATION_CATEGORIES,
    notificationCategorySettingKey,
    notificationSettingKey,
} from "@/components/notifications/notification-catalog";
import { useSaveSetting } from "@/components/settings/core/use-save-setting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotificationSettings() {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const { save: saveSetting, isSaving } = useSaveSetting();

    // Notification switches are not in the settings registry; they are saved as 1/0.
    const save = (key: string, next: boolean) => saveSetting(key, next ? 1 : 0);

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-lg font-medium">{t("notifications.settings.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("notifications.settings.description")}</p>
            </div>
            {NOTIFICATION_CATEGORIES.map((category) => {
                const categoryKey = notificationCategorySettingKey(category);
                const categoryOn = isNotificationSettingEnabled(settings[categoryKey]);
                return (
                    <Collapsible key={category} defaultOpen>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                                <div>
                                    <CollapsibleTrigger className="flex items-center gap-2 text-left">
                                        <ChevronDown className="size-4" />
                                        <CardTitle className="text-base">
                                            {t(`notifications.categories.${category}`)}
                                        </CardTitle>
                                    </CollapsibleTrigger>
                                    <CardDescription>
                                        {categoryOn
                                            ? t("notifications.settings.category_on")
                                            : t("notifications.settings.category_off")}
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={categoryOn}
                                    disabled={isSaving(categoryKey)}
                                    onCheckedChange={(checked) => void save(categoryKey, checked)}
                                    aria-label={t(`notifications.categories.${category}`)}
                                    data-testid={`notify-${categoryKey}`}
                                />
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="flex flex-col gap-3">
                                    {eventsForCategory(category).map((event) => {
                                        const eventKey = notificationSettingKey(event);
                                        const eventOn = isNotificationSettingEnabled(settings[eventKey]);
                                        return (
                                            <div key={event} className="flex items-center justify-between gap-3">
                                                <Label
                                                    htmlFor={eventKey}
                                                    className={cn(!categoryOn && "text-muted-foreground")}
                                                >
                                                    {t(`notifications.events.${event}.title`)}
                                                </Label>
                                                <Switch
                                                    id={eventKey}
                                                    checked={eventOn}
                                                    disabled={isSaving(eventKey)}
                                                    onCheckedChange={(checked) => void save(eventKey, checked)}
                                                    aria-label={t(`notifications.events.${event}.title`)}
                                                    data-testid={`notify-${eventKey}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                );
            })}
        </div>
    );
}
