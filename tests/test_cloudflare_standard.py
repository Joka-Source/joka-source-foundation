import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "tools" / "validate-cloudflare-standard.py"
SPEC = importlib.util.spec_from_file_location("validate_cloudflare_standard", MODULE_PATH)
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


class CloudflareStandardTests(unittest.TestCase):
    def setUp(self):
        self.standard = json.loads(
            (ROOT / "ops" / "cloudflare-standard.json").read_text(encoding="utf-8")
        )
        self.contract = {
            "domain": "example.org",
            "custody": {
                "account_alias": "JSF Cloudflare",
                "credential_authority": "QM",
                "account_id": "0" * 32,
                "zone_id": "1" * 32,
                "state": "active",
            },
            "release": {
                "content_source_commit": "a" * 40,
                "deployment_source_commit": "b" * 40,
                "worker_sha256": "sha256:" + "c" * 64,
                "assets_tree_sha256": "sha256:" + "d" * 64,
                "lockfile_sha256": "sha256:" + "e" * 64,
            },
            "worker": {
                "preview_version_id": "2f7a335e-7770-4fcb-b558-c5e88f074e17",
                "deployed_version_id": "2f7a335e-7770-4fcb-b558-c5e88f074e17",
                "require_same_version": True,
                "state": "active",
            },
            "zone": {
                "assigned_nameservers": [
                    "ada.ns.cloudflare.com.",
                    "bob.ns.cloudflare.com.",
                ],
                "delegation_state": "active",
                "dnssec": {
                    "current": "active",
                    "ds_digest": "sha256:" + "f" * 64,
                    "state": "active",
                },
            },
            "rollback": {
                "sites_origin": "https://rollback.example/",
                "registrar_nameservers": ["ns1.example.", "ns2.example."],
            },
        }

    def test_standard_is_complete_and_self_consistent(self):
        self.assertEqual(VALIDATOR.validate_standard(self.standard), [])
        self.assertEqual(self.standard["credential_authority"], "QM")
        self.assertTrue(self.standard["release"]["same_version_preview_to_production"])
        self.assertEqual(self.standard["verification"]["public_resolvers"], ["1.1.1.1", "8.8.8.8"])
        self.assertIn("rollback_target", self.standard["release"]["required_evidence"])

    def test_accepts_a_complete_domain_contract(self):
        self.assertEqual(VALIDATOR.validate_contract(self.standard, self.contract), [])

    def test_rejects_pending_or_mismatched_production(self):
        self.contract["worker"]["deployed_version_id"] = None
        self.contract["zone"]["assigned_nameservers"] = [None, None]
        errors = VALIDATOR.validate_contract(self.standard, self.contract)
        self.assertTrue(any("version" in error.lower() for error in errors))
        self.assertTrue(any("nameserver" in error.lower() for error in errors))

    def test_rejects_wrong_credential_authority_and_missing_rollback(self):
        self.contract["custody"]["credential_authority"] = "repository"
        self.contract["rollback"] = {}
        errors = VALIDATOR.validate_contract(self.standard, self.contract)
        self.assertTrue(any("credential authority" in error.lower() for error in errors))
        self.assertTrue(any("rollback" in error.lower() for error in errors))


if __name__ == "__main__":
    unittest.main()
