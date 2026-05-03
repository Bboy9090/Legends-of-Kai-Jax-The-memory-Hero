// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LegendsOfKaiJax",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .executable(name: "LegendsOfKaiJax", targets: ["LegendsOfKaiJax"])
    ],
    targets: [
        .executableTarget(
            name: "LegendsOfKaiJax",
            dependencies: ["GameEngineCore"],
            path: "Sources",
            resources: [
                .process("Resources")
            ],
            swiftSettings: [
                .interoperabilityMode(.Cxx)
            ]
        ),
        .target(
            name: "GameEngineCore",
            path: "GameEngineCore",
            exclude: ["tests", "IMPLEMENTATION_SUMMARY.md", "README.md", "STORY_MODE_README.md", "SECURITY_SUMMARY.md"],
            publicHeadersPath: "include",
            cxxSettings: [
                .headerSearchPath("include"),
                .headerSearchPath("include/ai"),
                .headerSearchPath("include/character"),
                .headerSearchPath("include/combat"),
                .headerSearchPath("include/input"),
                .headerSearchPath("include/story_mode")
            ]
        )
    ],
    cxxLanguageStandard: .cxx17
)
