import Foundation

extension Foundation.Bundle {
    static let module: Bundle = {
        let mainPath = Bundle.main.bundleURL.appendingPathComponent("LegendsOfKaiJax_LegendsOfKaiJax.bundle").path
        let buildPath = "/Users/bj90-m1/Documents/Documents - MacBook Pro/GitHub/Legends-of-Kai-Jax-The-memory-Hero/apps/ios/LegendsOfKaiJax/.build/arm64-apple-macosx/debug/LegendsOfKaiJax_LegendsOfKaiJax.bundle"

        let preferredBundle = Bundle(path: mainPath)

        guard let bundle = preferredBundle ?? Bundle(path: buildPath) else {
            // Users can write a function called fatalError themselves, we should be resilient against that.
            Swift.fatalError("could not load resource bundle: from \(mainPath) or \(buildPath)")
        }

        return bundle
    }()
}