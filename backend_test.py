#!/usr/bin/env python3
"""
Backend API Testing for Legends of Kai-Jax: The Memory King
Tests all game data endpoints and validates responses
"""

import requests
import sys
import json
from datetime import datetime

class KaiJaxAPITester:
    def __init__(self, base_url="https://legends-codex.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "Legends of Kai-Jax" in data.get("message", "")
            self.log_test("API Root", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_tails_endpoint(self):
        """Test /api/tails endpoint - should return 9 tails"""
        try:
            response = requests.get(f"{self.api_url}/tails", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = len(data) == 9
                if success:
                    # Verify tail structure
                    required_fields = ['id', 'name', 'element', 'color', 'description', 'signature_move', 'primary_use']
                    for tail in data:
                        for field in required_fields:
                            if field not in tail:
                                success = False
                                break
                        if not success:
                            break
            self.log_test("Tails Endpoint", success, f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            return success, data if success else []
        except Exception as e:
            self.log_test("Tails Endpoint", False, str(e))
            return False, []

    def test_characters_endpoint(self):
        """Test /api/characters endpoint - should return 5 characters"""
        try:
            response = requests.get(f"{self.api_url}/characters", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = len(data) == 5
                if success:
                    # Verify character structure
                    required_fields = ['id', 'name', 'title', 'description', 'abilities']
                    expected_ids = ['kai', 'jax', 'kaijax', 'boryn', 'borax']
                    actual_ids = [char['id'] for char in data]
                    success = all(char_id in actual_ids for char_id in expected_ids)
            self.log_test("Characters Endpoint", success, f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            return success, data if success else []
        except Exception as e:
            self.log_test("Characters Endpoint", False, str(e))
            return False, []

    def test_story_endpoint(self):
        """Test /api/story endpoint - should return 5 story acts"""
        try:
            response = requests.get(f"{self.api_url}/story", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = len(data) == 5
                if success:
                    # Verify story act structure
                    required_fields = ['act_number', 'title', 'subtitle', 'region', 'narrative']
                    for act in data:
                        for field in required_fields:
                            if field not in act:
                                success = False
                                break
                        if not success:
                            break
            self.log_test("Story Endpoint", success, f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            return success, data if success else []
        except Exception as e:
            self.log_test("Story Endpoint", False, str(e))
            return False, []

    def test_gods_endpoint(self):
        """Test /api/gods endpoint - should return 4 Sabertooth Gods"""
        try:
            response = requests.get(f"{self.api_url}/gods", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = len(data) == 4
                if success:
                    # Verify god structure
                    required_fields = ['name', 'domain', 'element', 'color', 'description']
                    expected_names = ['Kar-Voth', 'Thryxen', 'Pyraxis', 'Myrr\'Kai']
                    actual_names = [god['name'] for god in data]
                    success = all(name in actual_names for name in expected_names)
            self.log_test("Gods Endpoint", success, f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            return success, data if success else []
        except Exception as e:
            self.log_test("Gods Endpoint", False, str(e))
            return False, []

    def test_regions_endpoint(self):
        """Test /api/regions endpoint - should return 5 world regions"""
        try:
            response = requests.get(f"{self.api_url}/regions", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = len(data) == 5
                if success:
                    # Verify region structure
                    required_fields = ['name', 'description', 'danger_level', 'primary_enemies']
                    expected_names = ['Ashblock Heights', 'Fangforge Wastes', 'Veil Scar', 'Memory Grove', 'Abyssal Engine']
                    actual_names = [region['name'] for region in data]
                    success = all(name in actual_names for name in expected_names)
            self.log_test("Regions Endpoint", success, f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            return success, data if success else []
        except Exception as e:
            self.log_test("Regions Endpoint", False, str(e))
            return False, []

    def test_bible_endpoint(self):
        """Test /api/bible endpoint - should return full game bible"""
        try:
            response = requests.get(f"{self.api_url}/bible", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                # Verify bible structure
                required_fields = ['title', 'tagline', 'tails', 'characters', 'story_acts', 'gods', 'regions']
                success = all(field in data for field in required_fields)
                if success:
                    # Verify counts in bible
                    success = (len(data['tails']) == 9 and 
                              len(data['characters']) == 5 and 
                              len(data['story_acts']) == 5 and 
                              len(data['gods']) == 4 and 
                              len(data['regions']) == 5)
            self.log_test("Bible Endpoint", success, f"Status: {response.status_code}")
            return success, data if success else {}
        except Exception as e:
            self.log_test("Bible Endpoint", False, str(e))
            return False, {}

    def test_individual_endpoints(self):
        """Test individual item endpoints"""
        # Test individual tail
        try:
            response = requests.get(f"{self.api_url}/tails/1", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('name') == 'Ember Tail'
            self.log_test("Individual Tail (ID: 1)", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Individual Tail (ID: 1)", False, str(e))

        # Test individual character
        try:
            response = requests.get(f"{self.api_url}/characters/kai", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('name') == 'KAI'
            self.log_test("Individual Character (kai)", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Individual Character (kai)", False, str(e))

        # Test individual story act
        try:
            response = requests.get(f"{self.api_url}/story/1", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('title') == 'SURVIVAL'
            self.log_test("Individual Story Act (1)", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Individual Story Act (1)", False, str(e))
    
    def test_story_progress_enforcement(self):
        """Test story progress enforcement - sequential act progression"""
        import uuid
        player_id = f"test_player_{uuid.uuid4()}"
        
        try:
            # Test 1: Get initial progress (should default to Act 1, 3 tails)
            response = requests.get(f"{self.api_url}/story-progress/{player_id}", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data["current_act"] == 1 and data["max_tail_count"] == 3
            self.log_test("Story Progress - Initial State", success, f"Status: {response.status_code}")
            
            # Test 2: Advance to Act 2 (should succeed)
            response = requests.post(
                f"{self.api_url}/story-progress/{player_id}/advance",
                json={"current_act": 2},
                timeout=10
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data["current_act"] == 2 and data["max_tail_count"] >= 5
            self.log_test("Story Progress - Sequential Advance", success, f"Status: {response.status_code}")
            
            # Test 3: Try to skip to Act 4 (should fail - tier skipping not allowed)
            response = requests.post(
                f"{self.api_url}/story-progress/{player_id}/advance",
                json={"current_act": 4},
                timeout=10
            )
            success = response.status_code == 400  # Should be rejected
            self.log_test("Story Progress - Prevent Tier Skipping", success, f"Status: {response.status_code}")
            
            # Test 4: Try to go backwards to Act 1 (should fail)
            response = requests.post(
                f"{self.api_url}/story-progress/{player_id}/advance",
                json={"current_act": 1},
                timeout=10
            )
            success = response.status_code == 400  # Should be rejected
            self.log_test("Story Progress - Prevent Backward Progress", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Story Progress Enforcement", False, str(e))
    
    def test_tail_count_enforcement(self):
        """Test tail count enforcement - cannot decrease, must respect act limits"""
        import uuid
        player_id = f"test_player_{uuid.uuid4()}"
        
        try:
            # Initialize player at Act 1
            requests.get(f"{self.api_url}/story-progress/{player_id}", timeout=10)
            
            # Test 1: Try to set 6 tails in Act 1 (should fail - exceeds limit)
            response = requests.post(
                f"{self.api_url}/story-progress/{player_id}/tails",
                json={"tail_count": 6},
                timeout=10
            )
            success = response.status_code == 400  # Should be rejected
            self.log_test("Tail Count - Respect Act Limits", success, f"Status: {response.status_code}")
            
            # Test 2: Advance to Act 3 to unlock 6 tails
            requests.post(
                f"{self.api_url}/story-progress/{player_id}/advance",
                json={"current_act": 2},
                timeout=10
            )
            requests.post(
                f"{self.api_url}/story-progress/{player_id}/advance",
                json={"current_act": 3},
                timeout=10
            )
            
            # Test 3: Set 6 tails (should succeed in Act 3)
            response = requests.post(
                f"{self.api_url}/story-progress/{player_id}/tails",
                json={"tail_count": 6},
                timeout=10
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data["max_tail_count"] == 6
            self.log_test("Tail Count - Valid Increase", success, f"Status: {response.status_code}")
            
            # Test 4: Try to decrease to 4 tails (should fail)
            response = requests.post(
                f"{self.api_url}/story-progress/{player_id}/tails",
                json={"tail_count": 4},
                timeout=10
            )
            success = response.status_code == 400  # Should be rejected
            self.log_test("Tail Count - Prevent Decrease", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Tail Count Enforcement", False, str(e))

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Legends of Kai-Jax Backend API Tests")
        print(f"🎯 Testing API at: {self.api_url}")
        print("=" * 60)

        # Test API availability first
        if not self.test_api_root():
            print("❌ API Root failed - stopping tests")
            return False

        # Test main endpoints
        self.test_tails_endpoint()
        self.test_characters_endpoint()
        self.test_story_endpoint()
        self.test_gods_endpoint()
        self.test_regions_endpoint()
        self.test_bible_endpoint()
        
        # Test individual endpoints
        self.test_individual_endpoints()
        
        # Test story mode enforcement (NEW)
        self.test_story_progress_enforcement()
        self.test_tail_count_enforcement()

        # Print summary
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✨ Success rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = KaiJaxAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())