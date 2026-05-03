import SwiftUI

@main
struct LegendsOfKaiJaxApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .preferredColorScheme(.dark)
        }
    }
}
