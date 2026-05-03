#include "../../include/input/InputHandler.h"

namespace LegendsEngine {

InputHandler::InputHandler(Platform platform) : currentPlatform(platform) {
}

InputState InputHandler::GetCurrentInput() {
    // For mobile/testing, we often prefer the explicitly set internal state
    if (currentPlatform == Platform::MOBILE) {
        return internalState;
    }

    // Route to platform-specific input reader
    switch (currentPlatform) {
        case Platform::PC:
            return ReadKeyboardInput();
        case Platform::CONSOLE:
        case Platform::TABLET:
            return ReadGamepadInput();
        default:
            return internalState;
    }
}

void InputHandler::SetActionState(InputAction action, bool state) {
    switch (action) {
        case InputAction::MOVE_FORWARD: internalState.moveForward = state; break;
        case InputAction::MOVE_BACKWARD: internalState.moveBackward = state; break;
        case InputAction::MOVE_LEFT: internalState.moveLeft = state; break;
        case InputAction::MOVE_RIGHT: internalState.moveRight = state; break;
        case InputAction::SPRINT: internalState.sprint = state; break;
        case InputAction::ATTACK: internalState.attack = state; break;
        case InputAction::JUMP: internalState.jump = state; break;
    }
}

InputState InputHandler::ReadKeyboardInput() {
    InputState state;
    // Stub: returns zero state until input backend is integrated
    return state;
}

InputState InputHandler::ReadGamepadInput() {
    InputState state;
    // Stub: returns zero state until input backend is integrated
    return state;
}

InputState InputHandler::ReadTouchInput() {
    InputState state;
    // Stub: returns zero state until input backend is integrated
    return state;
}

} // namespace LegendsEngine
