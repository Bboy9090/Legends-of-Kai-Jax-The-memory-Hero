import SwiftUI
import SceneKit

struct GameView: View {
    @StateObject private var orchestrator = GameOrchestrator()
    
    var body: some View {
        ZStack {
            // SceneKit View for 3D Rendering
            SceneView(
                scene: orchestrator.scene,
                options: [.allowsCameraControl, .autoenablesDefaultLighting]
            )
            .edgesIgnoringSafeArea(.all)
            
            // HUD Overlay
            VStack {
                HStack {
                    Text("LEGENDS OF KAI-JAX")
                        .font(.custom("Bebas Neue", size: 24))
                        .foregroundColor(.white)
                        .padding()
                    Spacer()
                }
                Spacer()
                
                // Character Controls
                VStack(spacing: 10) {
                    HStack(spacing: 20) {
                        ControlButton(title: "MOVE", action: { orchestrator.setInputAction(action: .MOVE_FORWARD, state: true) })
                        ControlButton(title: "STOP", action: { orchestrator.setInputAction(action: .MOVE_FORWARD, state: false) })
                        ControlButton(title: "JUMP", action: { orchestrator.setInputAction(action: .JUMP, state: true) })
                    }
                    HStack(spacing: 20) {
                        ControlButton(title: "IDLE", action: { orchestrator.performAction(state: .IDLE_CALM) })
                        ControlButton(title: "ATTACK", action: { orchestrator.setInputAction(action: .ATTACK, state: true) })
                        ControlButton(title: "DODGE", action: { orchestrator.performAction(state: .DODGE_GROUND) })
                    }
                }
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            orchestrator.loadCharacter(id: "kaijax")
            orchestrator.startLoop()
        }
    }
}

struct ControlButton: View {
    let title: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .bold()
                .padding()
                .background(Color.blue.opacity(0.6))
                .foregroundColor(.white)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Color.white, lineWidth: 1))
        }
    }
}

#Preview {
    GameView()
}
