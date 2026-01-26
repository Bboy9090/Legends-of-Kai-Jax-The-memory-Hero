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
)
FetchContent_MakeAvailable(json)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Library target
add_library(LegendsEngineCore STATIC
    src/CharacterLoader.cpp
)

target_link_libraries(LegendsEngineCore
    PRIVATE nlohmann_json::nlohmann_json
)

# Test executable
add_executable(CharacterLoaderTest
    tests/CharacterLoaderTest.cpp
)

target_link_libraries(CharacterLoaderTest
    PRIVATE LegendsEngineCore
    PRIVATE nlohmann_json::nlohmann_json
)

# Set output directories
set_target_properties(LegendsEngineCore CharacterLoaderTest
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
