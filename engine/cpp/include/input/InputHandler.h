#pragma once

namespace LegendsEngine {

/**
 * Platform - Enum representing different platform types
 * Used to select appropriate input handling strategy
 */
enum class Platform {
    PC,           // Desktop (keyboard/mouse)
    CONSOLE,      // Console (gamepad)
    TABLET,       // Tablet (gamepad or touch)
    MOBILE        // Mobile (touch)
};

/**
 * InputAction - Enum representing different player input actions
 * These are platform-agnostic actions that can be mapped to any input device
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
 * InputState - Structure containing boolean flags for each input action
 * Represents the current state of all player inputs at a given frame
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
 * InputHandler - Platform-agnostic input handling system
 * 
 * This class provides a unified interface for reading player input
 * regardless of the platform (PC, console, mobile, tablet).
 * 
 * DESIGN PHILOSOPHY:
 * - Platform-agnostic: Game logic sees same InputState regardless of device
 * - Single responsibility: Only handles input reading, not game logic
 * - Stateless: Each GetCurrentInput() call reads fresh input state
 * 
 * PLATFORM MAPPING:
 * - PC: Keyboard/Mouse
 * - Console/Tablet: Gamepad
 * - Mobile: Touch controls
 * 
 * The actual platform-specific input mapping is handled in the implementation,
 * but the game logic only sees the unified InputState structure.
 */
class InputHandler {
public:
    /**
     * Construct InputHandler with platform detection
     * 
     * @param platform The platform to use for input handling (default: PC)
     */
    explicit InputHandler(Platform platform = Platform::PC);
    ~InputHandler() = default;

    // Disable copy/move
    InputHandler(const InputHandler&) = delete;
    InputHandler& operator=(const InputHandler&) = delete;
    InputHandler(InputHandler&&) = delete;
    InputHandler& operator=(InputHandler&&) = delete;

    /**
     * Get the current input state
     * 
     * Reads all relevant input devices and returns a unified InputState
     * representing what the player is currently doing.
     * 
     * @return Current state of all player inputs
     */
    InputState GetCurrentInput();

    /**
     * Get the current platform
     * 
     * @return The platform type this handler is configured for
     */
    Platform GetPlatform() const { return currentPlatform; }

private:
    Platform currentPlatform;

    // Platform-specific input reading methods
    InputState ReadKeyboardInput();
    InputState ReadGamepadInput();
    InputState ReadTouchInput();
};

} // namespace LegendsEngine
