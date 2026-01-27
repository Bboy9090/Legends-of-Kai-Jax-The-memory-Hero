#pragma once

namespace LegendsEngine {

/**
 * InputAction - Enum representing player input actions
 * These are platform-agnostic actions that map to specific inputs per platform
 */
enum class InputAction {
    MOVE_FORWARD,
    MOVE_BACKWARD,
    MOVE_LEFT,
    MOVE_RIGHT,
    SPRINT,
    ATTACK,
    JUMP
};

/**
 * InputState - Struct containing boolean flags for each input action
 * Represents the current state of all player inputs in a single frame
 */
struct InputState {
    bool moveForward = false;
    bool moveBackward = false;
    bool moveLeft = false;
    bool moveRight = false;
    bool sprint = false;
    bool attack = false;
    bool jump = false;
};

/**
 * InputHandler - Platform-agnostic input management system
 * 
 * This class abstracts player input away from platform-specific details.
 * It provides a unified interface for querying input state regardless of
 * whether the player is using keyboard, gamepad, or touch controls.
 * 
 * DESIGN PHILOSOPHY:
 * - Platform-agnostic: Same API for PC, mobile, tablet
 * - Input mapping diverges per platform, logic remains unified
 * - Single source of truth for current frame's input state
 * 
 * PLATFORM MAPPING:
 * - PC: Keyboard (WASD/arrows) and Mouse
 * - Console: Gamepad (sticks and buttons)
 * - Mobile: Touch controls (virtual joystick)
 * - Tablet: Touch controls (scaled for larger screen)
 */
class InputHandler {
public:
    InputHandler() = default;
    ~InputHandler() = default;

    /**
     * GetCurrentInput - Query the current input state for this frame
     * 
     * This method reads platform-specific input and returns it as a
     * platform-agnostic InputState struct.
     * 
     * TODO: Implement platform-specific input reading:
     * - Keyboard input handling (PC):
     *   - WASD or arrow keys for movement
     *   - Shift for sprint
     *   - Left mouse button or key for attack
     *   - Space for jump
     * 
     * - Gamepad input handling (console/tablet with controller):
     *   - Left stick for movement
     *   - Right trigger or button for sprint
     *   - Face button (A/X) for attack
     *   - Face button (B/Circle) for jump
     * 
     * - Touch input handling (mobile):
     *   - Virtual joystick for movement
     *   - Sprint button overlay
     *   - Attack button overlay
     *   - Jump button overlay
     * 
     * NOTE: Logic remains unified; only input mapping diverges per platform
     * 
     * @return InputState containing current frame's input flags
     */
    InputState GetCurrentInput();

private:
    // Current input state (cached for the frame)
    InputState currentState;
};

} // namespace LegendsEngine
