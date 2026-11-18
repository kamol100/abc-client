"""Validate specification inventory and summarize recorded evidence; runs no browser tests."""

import json
import re
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]


def main():
    features = json.loads((BASE / "feature-inventory.json").read_text())
    routes = json.loads((BASE / "route-inventory.json").read_text())
    cases = json.loads((BASE / "coverage-register.json").read_text())["scenarios"]
    actual = {str(p.relative_to(ROOT)) for p in (ROOT / "app").rglob("page.tsx")}
    mapped = [r["page"] for r in routes]
    assert set(mapped) == actual, "Route inventory differs from current page files"
    assert len(mapped) == len(set(mapped)), "Duplicate page mapping"
    feature_names = {f["feature"] for f in features}
    assert len(feature_names) == len(features), "Duplicate feature"
    for entry in [*features, *routes]:
        assert (BASE / entry["ticket"]).is_file(), entry
        assert entry["feature"] in feature_names, entry
    ids = [c["id"] for c in cases]
    assert len(ids) == len(set(ids)), "Duplicate scenario ID"
    documented = set()
    for feature in features:
        documented.update(re.findall(
            r"^- ((?:FT\d+-\d+)|(?:(?:CL|DB|ST|IV|EX|RS|NW)-[A-Z]\d+)|(?:PS-E\d+)) \[",
            (BASE / feature["ticket"]).read_text(), re.M,
        ))
    assert documented == set(ids), "Ticket scenarios and register differ"
    for feature in features:
        assert any(c["feature"] == feature["feature"] for c in cases), feature
    for case in cases:
        assert case["feature"] in feature_names, case
        assert case["id"] in (BASE / case["ticket"]).read_text(), case
        assert case["review"] in {"pending", "approved", "excluded"}, case
        assert case["status"] in {
            "draft", "ready", "implemented", "passing", "failing", "blocked", "skipped"
        }, case
        if case["review"] == "excluded":
            assert case.get("exclusion_reason") and case.get("approved_by"), case
        if case["status"] == "passing":
            assert case["review"] == "approved" and case["test_refs"], case
            for ref in case["test_refs"]:
                assert ref.get("title") and (ROOT / ref["path"]).is_file(), case
            run = case.get("last_run") or {}
            assert run.get("result") == "passed", case
            assert all(run.get(k) for k in [
                "environment", "command", "timestamp", "source_state", "artifact"
            ]), case
    # Check local documentation links without treating code-formatted paths as links.
    for doc in BASE.rglob("*.md"):
        for target in re.findall(r"\]\(([^)]+)\)", doc.read_text()):
            if "://" not in target and not target.startswith("#"):
                assert (doc.parent / target.split("#")[0]).exists(), (doc, target)
    applicable = [c for c in cases if c["review"] != "excluded"]
    passed = [c for c in applicable if c["status"] == "passing"]
    critical = [c for c in applicable if c["priority"] == "P0"]
    approved = [c for c in applicable if c["review"] == "approved"]
    route_passes = 0
    for route in routes:
        assert route.get("status") in {"draft", "passing", "blocked", "excluded"}, route
        if route["status"] == "excluded":
            assert route.get("exclusion_reason") and route.get("approved_by"), route
        if route["status"] == "passing":
            assert route.get("scenario_ids"), route
            assert all(i in {c["id"] for c in passed} for i in route["scenario_ids"]), route
            route_passes += 1
    applicable_routes = sum(r["status"] != "excluded" for r in routes)

    def percent(n, d):
        return round(100 * n / d, 2) if d else 0

    print(json.dumps({
        "mapped_pages": len(mapped), "current_pages": len(actual),
        "feature_workspaces": len(features), "registered_scenarios": len(cases),
        "states": dict(Counter(c["status"] for c in cases)),
        "review_readiness_percent": percent(len(approved), len(applicable)),
        "recorded_pass_coverage_percent": percent(len(passed), len(applicable)),
        "critical_pass_coverage_percent": percent(
            sum(c["status"] == "passing" for c in critical), len(critical)
        ),
        "route_execution_coverage_percent": percent(route_passes, applicable_routes),
        "target_met": bool(applicable) and (
            len(passed) / len(applicable) > 0.9
            and all(c["status"] == "passing" for c in critical)
            and len(approved) == len(applicable)
            and route_passes == applicable_routes
        ),
        "note": "Recorded evidence only; this checker does not execute tests or verify report truth/freshness."
    }, indent=2))


if __name__ == "__main__":
    main()
