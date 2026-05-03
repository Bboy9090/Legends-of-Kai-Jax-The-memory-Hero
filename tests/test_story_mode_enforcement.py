#!/usr/bin/env python3
"""
Unit tests for StoryModeManager enforcement logic
Tests the enforcement rules without requiring a running server
"""

import sys


class StoryModeManager:
    """
    Story Mode Manager with ENFORCED tail progression.
    Copy of the class from server.py for standalone testing.
    """
    
    ACT_TAIL_LIMITS = {
        1: 3,   # Act 1: Survival - 3-Tail fusion
        2: 5,   # Act 2: Law - Expand to 4-5 tails
        3: 6,   # Act 3: Memory - Expand to 6 tails
        4: 8,   # Act 4: Alignment - Expand to 7-8 tails
        5: 9,   # Act 5: Sovereignty - Ninth tail manifestation
    }
    
    @classmethod
    def get_max_tails_for_act(cls, act_number: int) -> int:
        """Get the maximum tail count allowed for a given act."""
        if act_number < 1:
            return 3  # Default to minimum
        if act_number > 5:
            return 9  # Max tails
        return cls.ACT_TAIL_LIMITS.get(act_number, 3)
    
    @classmethod
    def validate_act_progression(cls, current_act: int, new_act: int) -> tuple:
        """
        Validate that act progression is sequential.
        Returns (is_valid, error_message)
        """
        if new_act < 1 or new_act > 5:
            return False, f"Invalid act number: {new_act}. Must be between 1 and 5."
        
        if new_act < current_act:
            return False, f"Cannot decrease act from {current_act} to {new_act}. Story progression is irreversible."
        
        if new_act > current_act + 1:
            return False, f"Cannot skip acts. Current act: {current_act}, attempted: {new_act}. Must progress sequentially."
        
        return True, ""
    
    @classmethod
    def validate_tail_count(cls, current_tails: int, new_tails: int, current_act: int) -> tuple:
        """
        Validate tail count changes.
        Returns (is_valid, error_message)
        """
        if new_tails < 3 or new_tails > 9:
            return False, f"Invalid tail count: {new_tails}. Must be between 3 and 9."
        
        if new_tails < current_tails:
            return False, f"Tail count cannot decrease from {current_tails} to {new_tails}. Tail progression is irreversible."
        
        max_allowed = cls.get_max_tails_for_act(current_act)
        if new_tails > max_allowed:
            return False, f"Cannot have {new_tails} tails in Act {current_act}. Maximum allowed: {max_allowed}. Complete more acts to unlock additional tails."
        
        # Check for tier skipping (e.g., going from 3 to 6 tails without progressing through 4-5)
        if new_tails > current_tails + 3:
            return False, f"Cannot skip tail tiers. Current: {current_tails}, attempted: {new_tails}. Progression must be gradual."
        
        return True, ""


def test_get_max_tails_for_act():
    """Test that max tail counts are correctly mapped to acts"""
    print("Testing get_max_tails_for_act...")
    
    assert StoryModeManager.get_max_tails_for_act(1) == 3, "Act 1 should allow 3 tails"
    assert StoryModeManager.get_max_tails_for_act(2) == 5, "Act 2 should allow 5 tails"
    assert StoryModeManager.get_max_tails_for_act(3) == 6, "Act 3 should allow 6 tails"
    assert StoryModeManager.get_max_tails_for_act(4) == 8, "Act 4 should allow 8 tails"
    assert StoryModeManager.get_max_tails_for_act(5) == 9, "Act 5 should allow 9 tails"
    
    # Edge cases
    assert StoryModeManager.get_max_tails_for_act(0) == 3, "Act 0 should default to 3 tails"
    assert StoryModeManager.get_max_tails_for_act(6) == 9, "Act 6 should default to 9 tails"
    
    print("✅ get_max_tails_for_act tests passed")


def test_validate_act_progression():
    """Test act progression validation rules"""
    print("\nTesting validate_act_progression...")
    
    # Valid sequential progression
    is_valid, msg = StoryModeManager.validate_act_progression(1, 2)
    assert is_valid, f"Should allow Act 1 → 2: {msg}"
    
    is_valid, msg = StoryModeManager.validate_act_progression(2, 3)
    assert is_valid, f"Should allow Act 2 → 3: {msg}"
    
    # Staying in same act (valid - replaying)
    is_valid, msg = StoryModeManager.validate_act_progression(3, 3)
    assert is_valid, f"Should allow staying in Act 3: {msg}"
    
    # Invalid: tier skipping
    is_valid, msg = StoryModeManager.validate_act_progression(1, 3)
    assert not is_valid, "Should reject skipping from Act 1 to 3"
    assert "skip" in msg.lower(), f"Error message should mention skipping: {msg}"
    
    is_valid, msg = StoryModeManager.validate_act_progression(2, 5)
    assert not is_valid, "Should reject skipping from Act 2 to 5"
    
    # Invalid: going backwards
    is_valid, msg = StoryModeManager.validate_act_progression(3, 1)
    assert not is_valid, "Should reject going backwards from Act 3 to 1"
    assert "decrease" in msg.lower() or "backward" in msg.lower(), f"Error message should mention backward progression: {msg}"
    
    # Invalid: out of range
    is_valid, msg = StoryModeManager.validate_act_progression(1, 6)
    assert not is_valid, "Should reject Act 6 (out of range)"
    
    is_valid, msg = StoryModeManager.validate_act_progression(1, 0)
    assert not is_valid, "Should reject Act 0 (out of range)"
    
    print("✅ validate_act_progression tests passed")


def test_validate_tail_count():
    """Test tail count validation rules"""
    print("\nTesting validate_tail_count...")
    
    # Valid increases within act limits
    is_valid, msg = StoryModeManager.validate_tail_count(3, 3, 1)
    assert is_valid, f"Should allow staying at 3 tails in Act 1: {msg}"
    
    is_valid, msg = StoryModeManager.validate_tail_count(3, 4, 2)
    assert is_valid, f"Should allow 3 → 4 tails in Act 2: {msg}"
    
    is_valid, msg = StoryModeManager.validate_tail_count(4, 5, 2)
    assert is_valid, f"Should allow 4 → 5 tails in Act 2: {msg}"
    
    is_valid, msg = StoryModeManager.validate_tail_count(5, 6, 3)
    assert is_valid, f"Should allow 5 → 6 tails in Act 3: {msg}"
    
    # Invalid: decreasing tail count
    is_valid, msg = StoryModeManager.validate_tail_count(5, 4, 2)
    assert not is_valid, "Should reject decreasing from 5 to 4 tails"
    assert "decrease" in msg.lower() or "cannot" in msg.lower(), f"Error message should mention decrease: {msg}"
    
    is_valid, msg = StoryModeManager.validate_tail_count(6, 3, 3)
    assert not is_valid, "Should reject decreasing from 6 to 3 tails"
    
    # Invalid: exceeding act limit
    is_valid, msg = StoryModeManager.validate_tail_count(3, 6, 1)
    assert not is_valid, "Should reject 6 tails in Act 1 (limit is 3)"
    assert "maximum" in msg.lower() or "exceed" in msg.lower(), f"Error message should mention limit: {msg}"
    
    is_valid, msg = StoryModeManager.validate_tail_count(3, 7, 2)
    assert not is_valid, "Should reject 7 tails in Act 2 (limit is 5)"
    
    is_valid, msg = StoryModeManager.validate_tail_count(5, 9, 3)
    assert not is_valid, "Should reject 9 tails in Act 3 (limit is 6)"
    
    # Invalid: tier skipping
    is_valid, msg = StoryModeManager.validate_tail_count(3, 7, 4)
    assert not is_valid, "Should reject jumping from 3 to 7 tails (too large jump)"
    assert "skip" in msg.lower() or "gradual" in msg.lower(), f"Error message should mention tier skipping: {msg}"
    
    # Invalid: out of range
    is_valid, msg = StoryModeManager.validate_tail_count(3, 2, 1)
    assert not is_valid, "Should reject 2 tails (below minimum)"
    
    is_valid, msg = StoryModeManager.validate_tail_count(8, 10, 5)
    assert not is_valid, "Should reject 10 tails (above maximum)"
    
    print("✅ validate_tail_count tests passed")


def test_act_tail_limits_mapping():
    """Test that ACT_TAIL_LIMITS matches the story design"""
    print("\nTesting ACT_TAIL_LIMITS mapping...")
    
    expected = {
        1: 3,   # Act 1: SURVIVAL - 3-Tail fusion
        2: 5,   # Act 2: LAW - Expand to 4-5 tails
        3: 6,   # Act 3: MEMORY - Expand to 6 tails
        4: 8,   # Act 4: ALIGNMENT - Expand to 7-8 tails
        5: 9,   # Act 5: SOVEREIGNTY - Ninth tail
    }
    
    assert StoryModeManager.ACT_TAIL_LIMITS == expected, "ACT_TAIL_LIMITS should match story design"
    
    print("✅ ACT_TAIL_LIMITS mapping tests passed")


def test_enforcement_scenarios():
    """Test realistic progression scenarios"""
    print("\nTesting realistic progression scenarios...")
    
    # Scenario 1: Normal progression through all acts
    current_act = 1
    current_tails = 3
    
    # Advance to Act 2
    is_valid, _ = StoryModeManager.validate_act_progression(current_act, 2)
    assert is_valid, "Should allow advancing to Act 2"
    current_act = 2
    
    # Unlock 4th tail
    is_valid, _ = StoryModeManager.validate_tail_count(current_tails, 4, current_act)
    assert is_valid, "Should allow unlocking 4th tail in Act 2"
    current_tails = 4
    
    # Advance to Act 3
    is_valid, _ = StoryModeManager.validate_act_progression(current_act, 3)
    assert is_valid, "Should allow advancing to Act 3"
    current_act = 3
    
    # Unlock 6th tail
    is_valid, _ = StoryModeManager.validate_tail_count(current_tails, 6, current_act)
    assert is_valid, "Should allow unlocking 6th tail in Act 3"
    
    # Scenario 2: Try to exploit system
    # Can't skip to Act 5 from Act 3
    is_valid, _ = StoryModeManager.validate_act_progression(3, 5)
    assert not is_valid, "Should prevent skipping to Act 5"
    
    # Can't get 9 tails in Act 3
    is_valid, _ = StoryModeManager.validate_tail_count(6, 9, 3)
    assert not is_valid, "Should prevent getting 9 tails in Act 3"
    
    print("✅ Realistic scenario tests passed")


def run_all_tests():
    """Run all unit tests"""
    print("=" * 80)
    print("STORY MODE MANAGER - ENFORCEMENT UNIT TESTS")
    print("=" * 80)
    
    try:
        test_get_max_tails_for_act()
        test_validate_act_progression()
        test_validate_tail_count()
        test_act_tail_limits_mapping()
        test_enforcement_scenarios()
        
        print("\n" + "=" * 80)
        print("🎉 ALL UNIT TESTS PASSED!")
        print("=" * 80)
        return True
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        print("=" * 80)
        return False
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        print("=" * 80)
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
