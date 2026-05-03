// GameView.swift
//
// SceneKit 3D starter for Kai Jax (iOS)

import SwiftUI
import SceneKit

struct GameView: UIViewRepresentable {
    func makeUIView(context: Context) -> SCNView {
        let sceneView = SCNView()
        sceneView.backgroundColor = .black
        sceneView.scene = makeScene()
        sceneView.allowsCameraControl = true // For easy navigation
        sceneView.autoenablesDefaultLighting = true
        return sceneView
    }

    func updateUIView(_ uiView: SCNView, context: Context) {}

    private func makeScene() -> SCNScene {
        let scene = SCNScene()
        
        // Camera
        let cameraNode = SCNNode()
        cameraNode.camera = SCNCamera()
        cameraNode.position = SCNVector3(x: 0, y: 2, z: 10)
        scene.rootNode.addChildNode(cameraNode)
        
        // Light
        let lightNode = SCNNode()
        lightNode.light = SCNLight()
        lightNode.light?.type = .omni
        lightNode.position = SCNVector3(x: 5, y: 10, z: 10)
        scene.rootNode.addChildNode(lightNode)
        
        // Floor
        let floor = SCNFloor()
        floor.reflectivity = 0.1
        let floorNode = SCNNode(geometry: floor)
        scene.rootNode.addChildNode(floorNode)
        
        // Placeholder model (sphere)
        let sphere = SCNSphere(radius: 1.0)
        sphere.firstMaterial?.diffuse.contents = UIColor.systemTeal
        let heroNode = SCNNode(geometry: sphere)
        heroNode.position = SCNVector3(0, 1, 0)
        scene.rootNode.addChildNode(heroNode)
        
        return scene
    }
}

// To preview in SwiftUI
#Preview {
    GameView()
}
