cmake_minimum_required(VERSION 3.15)
project(LegendsEngine VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable compiler warnings
if(MSVC)
    add_compile_options(/W4)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Find or fetch nlohmann/json
include(FetchContent)
FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
    URL_HASH SHA256=d6c65aca6b1ed68e7a182f4757257b107ae403032760ed6ef121c9d55e81757d
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(json)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Library target
add_library(LegendsEngineCore STATIC
    src/CharacterLoader.cpp
    src/Character.cpp
    src/CharacterFactory.cpp
    src/AnimationComponent.cpp
<<<<<<< HEAD
    src/InputHandler.cpp
    src/StateManager.cpp
=======
    src/input/InputHandler.cpp
    src/character/StateManager.cpp
>>>>>>> origin/main
)

target_link_libraries(LegendsEngineCore
    PUBLIC nlohmann_json::nlohmann_json
)

# Test executable
add_executable(CharacterLoaderTest
    tests/CharacterLoaderTest.cpp
)

target_link_libraries(CharacterLoaderTest
    PRIVATE LegendsEngineCore
)

# Test executable for CharacterFactory
add_executable(CharacterFactoryTest
    tests/CharacterFactoryTest.cpp
)

target_link_libraries(CharacterFactoryTest
    PRIVATE LegendsEngineCore
)

# Test executable for AnimationComponent
add_executable(AnimationComponentTest
    tests/AnimationComponentTest.cpp
)

target_link_libraries(AnimationComponentTest
    PRIVATE LegendsEngineCore
)

# Test executable for Animation Integration
add_executable(AnimationIntegrationTest
    tests/AnimationIntegrationTest.cpp
)

target_link_libraries(AnimationIntegrationTest
    PRIVATE LegendsEngineCore
)

# Test executable for Input System
add_executable(InputSystemTest
    tests/InputSystemTest.cpp
)

target_link_libraries(InputSystemTest
    PRIVATE LegendsEngineCore
)

<<<<<<< HEAD
# Set output directories
set_target_properties(LegendsEngineCore CharacterLoaderTest CharacterFactoryTest AnimationComponentTest AnimationIntegrationTest InputSystemTest
=======
# Test executable for Character Input Integration
add_executable(CharacterInputIntegrationTest
    tests/CharacterInputIntegrationTest.cpp
)

target_link_libraries(CharacterInputIntegrationTest
    PRIVATE LegendsEngineCore
)

# Set output directories
set_target_properties(LegendsEngineCore CharacterLoaderTest CharacterFactoryTest AnimationComponentTest AnimationIntegrationTest InputSystemTest CharacterInputIntegrationTest
>>>>>>> origin/main
    PROPERTIES
    ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

# Installation rules
install(TARGETS LegendsEngineCore
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
)

install(DIRECTORY include/
    DESTINATION include/LegendsEngine
    FILES_MATCHING PATTERN "*.h"
)

# Enable testing
enable_testing()
add_test(NAME CharacterLoaderTest COMMAND CharacterLoaderTest)
add_test(NAME CharacterFactoryTest COMMAND CharacterFactoryTest)
add_test(NAME AnimationComponentTest COMMAND AnimationComponentTest)
add_test(NAME AnimationIntegrationTest COMMAND AnimationIntegrationTest)
add_test(NAME InputSystemTest COMMAND InputSystemTest)
<<<<<<< HEAD
=======
add_test(NAME CharacterInputIntegrationTest COMMAND CharacterInputIntegrationTest)
>>>>>>> origin/main
