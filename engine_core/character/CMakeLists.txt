cmake_minimum_required(VERSION 3.15)
project(LegendsEngineCharacterLoader VERSION 1.0.0 LANGUAGES CXX)

# C++17 required for std::filesystem and modern features
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Find nlohmann/json
# This will look for nlohmann_json via find_package or fallback to FetchContent
find_package(nlohmann_json 3.2.0 QUIET)

if(NOT nlohmann_json_FOUND)
    message(STATUS "nlohmann_json not found, fetching from GitHub...")
    include(FetchContent)
    FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.3
        GIT_SHALLOW TRUE
    )
    FetchContent_MakeAvailable(nlohmann_json)
endif()

# Character loader library
add_library(character_loader STATIC
    CharacterLoader.cpp
)

target_include_directories(character_loader
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/..
)

target_link_libraries(character_loader
    PUBLIC
        nlohmann_json::nlohmann_json
)

# Compiler warnings
if(MSVC)
    target_compile_options(character_loader PRIVATE /W4)
else()
    target_compile_options(character_loader PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Optional: Add example executable
option(BUILD_EXAMPLES "Build example programs" OFF)

if(BUILD_EXAMPLES)
    add_executable(load_kai_jax_example
        example_load_kai_jax.cpp
    )
    
    target_link_libraries(load_kai_jax_example
        PRIVATE
            character_loader
    )
endif()

# Installation rules (optional)
install(TARGETS character_loader
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
)

install(FILES
    CharacterTypes.h
    CharacterSpecification.h
    DESTINATION include/character
)
