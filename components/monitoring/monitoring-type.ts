// API payloads of the device monitoring endpoints (contract: POST /devices/{id}/ping,
// GET /devices/{id}/monitoring, GET /devices/{id}/checks). Times are ISO-8601 strings.

export type MonitorState = "up" | "down" | "unknown";

export type MonitoringPeriod = "24h" | "7d" | "30d";

export interface PingResult {
    result: MonitorState;
    reason: string | null;
    sent: number;
    received: number;
    loss_pct: number | null;
    rtt_min_ms: number | null;
    rtt_avg_ms: number | null;
    rtt_max_ms: number | null;
    replies: { seq: number; rtt_ms: number | null }[];
    checked_at: string;
}

export interface DeviceOutage {
    id: string;
    started_at: string;
    resolved_at: string | null;
    duration_seconds: number | null;
    type: "device_down" | "router_unreachable";
    affected_clients: number | null;
    acknowledged_by: string | null;
    acknowledged_at: string | null;
    note: string | null;
    status: "open" | "resolved";
}

export interface DeviceMonitoring {
    device: {
        id: string;
        name: string;
        device_ip: string | null;
        category: string;
        monitor_enabled: boolean;
        monitor_state: MonitorState;
        state_changed_at: string | null;
        last_checked_at: string | null;
        last_rtt_ms: number | null;
        check_interval_minutes: number | null;
        olt_id: string | null;
    };
    period: MonitoringPeriod;
    from: string;
    to: string;
    stats: {
        uptime_pct: number | null;
        avg_rtt_ms: number | null;
        p95_rtt_ms: number | null;
        loss_pct: number | null;
        outages: number;
        mttr_seconds: number | null;
        checks: number;
    };
    daily: { date: string; down_seconds: number; monitored: boolean }[];
    uptime_90d: number | null;
    latency: {
        bucket_seconds: number;
        points: { t: string; avg: number | null; min: number | null; max: number | null; failed: boolean }[];
    };
    timeline: { state: MonitorState; from: string; to: string }[];
    outages: DeviceOutage[];
}

export interface DeviceCheck {
    id: number;
    checked_at: string;
    source: "auto" | "manual";
    user: string | null;
    result: MonitorState;
    rtt_min_ms: number | null;
    rtt_avg_ms: number | null;
    rtt_max_ms: number | null;
    sent: number;
    received: number;
    loss_pct: number | null;
}
