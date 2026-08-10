#!/usr/bin/env python3
"""Validate the JSF Cloudflare standard and production domain contracts."""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List


FULL_GIT_SHA = re.compile(r"^[0-9a-f]{40}$")
SHA256 = re.compile(r"^sha256:[0-9a-f]{64}$")
VERSION_ID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
REQUIRED_EVIDENCE = {
    "content_source_commit",
    "deployment_source_commit",
    "lockfile_sha256",
    "worker_sha256",
    "assets_tree_sha256",
    "immutable_version_id",
    "preview_url",
    "deployed_version_id",
    "rollback_target",
}
DNS_CUTOVER_SEQUENCE = [
    "inventory_existing_zone",
    "remove_stale_parent_ds",
    "create_and_verify_cloudflare_zone",
    "replace_registrar_nameservers",
    "verify_unsigned_delegation",
    "enable_cloudflare_dnssec",
    "install_new_parent_ds",
    "verify_dnssec_chain",
]


def validate_standard(standard: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    if standard.get("schema") != 1:
        errors.append("standard schema must be 1")
    if standard.get("provider") != "Cloudflare":
        errors.append("provider must be Cloudflare")
    if standard.get("credential_authority") != "QM":
        errors.append("credential authority must be QM")
    release = standard.get("release", {})
    if not REQUIRED_EVIDENCE.issubset(set(release.get("required_evidence", []))):
        errors.append("release evidence contract is incomplete")
    if release.get("same_version_preview_to_production") is not True:
        errors.append("preview and production must use the same version")
    if release.get("reproducible_build_required") is not True:
        errors.append("reproducible builds must be required")
    dns = standard.get("dns", {})
    if dns.get("assigned_nameserver_count") != 2:
        errors.append("exactly two assigned nameservers must be required")
    if dns.get("cutover_sequence") != DNS_CUTOVER_SEQUENCE:
        errors.append("DNS and DNSSEC cutover sequence is unsafe")
    verification = standard.get("verification", {})
    if verification.get("public_resolvers") != ["1.1.1.1", "8.8.8.8"]:
        errors.append("independent public resolver set is incomplete")
    if standard.get("rollback", {}).get("drill_required_before_closure") is not True:
        errors.append("rollback drill must be required before closure")
    return errors


def validate_contract(standard: Dict[str, Any], contract: Dict[str, Any]) -> List[str]:
    errors = validate_standard(standard)
    custody = contract.get("custody", {})
    if custody.get("account_alias") != standard.get("account_alias"):
        errors.append("Cloudflare account alias does not match JSF custody")
    if custody.get("credential_authority") != standard.get("credential_authority"):
        errors.append("credential authority does not match the JSF standard")
    for key in ("account_id", "zone_id"):
        if not custody.get(key):
            errors.append(f"custody {key} is missing")
    if custody.get("state") != "active":
        errors.append("custody state is not active")

    release = contract.get("release", {})
    for key in ("content_source_commit", "deployment_source_commit"):
        if not FULL_GIT_SHA.fullmatch(str(release.get(key, ""))):
            errors.append(f"release {key} is not a full Git SHA")
    for key in ("worker_sha256", "assets_tree_sha256", "lockfile_sha256"):
        if not SHA256.fullmatch(str(release.get(key, ""))):
            errors.append(f"release {key} is not a SHA-256 digest")

    worker = contract.get("worker", {})
    preview = worker.get("preview_version_id")
    deployed = worker.get("deployed_version_id")
    if not VERSION_ID.fullmatch(str(preview or "")) or preview != deployed:
        errors.append("preview and production version IDs are missing or different")
    if worker.get("require_same_version") is not True or worker.get("state") != "active":
        errors.append("immutable Worker version promotion is not active")

    zone = contract.get("zone", {})
    nameservers = zone.get("assigned_nameservers", [])
    if (
        len(nameservers) != standard.get("dns", {}).get("assigned_nameserver_count")
        or len(set(nameservers)) != 2
        or not all(isinstance(value, str) and value.endswith(".ns.cloudflare.com.") for value in nameservers)
    ):
        errors.append("assigned nameservers are not two distinct Cloudflare nameservers")
    if zone.get("delegation_state") != "active":
        errors.append("Cloudflare delegation is not active")
    dnssec = zone.get("dnssec", {})
    if dnssec.get("current") != "active" or dnssec.get("state") != "active":
        errors.append("DNSSEC is not active")
    if not SHA256.fullmatch(str(dnssec.get("ds_digest", ""))):
        errors.append("DNSSEC DS digest is missing or invalid")

    rollback = contract.get("rollback", {})
    if not str(rollback.get("sites_origin", "")).startswith("https://"):
        errors.append("independent HTTPS rollback origin is missing")
    registrar_nameservers = rollback.get("registrar_nameservers", [])
    if len(registrar_nameservers) != 2 or not all(registrar_nameservers):
        errors.append("registrar rollback delegation is missing")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("standard", type=Path)
    parser.add_argument("--contract", type=Path)
    arguments = parser.parse_args()
    standard = json.loads(arguments.standard.read_text(encoding="utf-8"))
    errors = validate_standard(standard)
    if arguments.contract:
        contract = json.loads(arguments.contract.read_text(encoding="utf-8"))
        errors.extend(validate_contract(standard, contract))
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("JSF Cloudflare standard validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
