import Foundation
import QuartzCore
import SceneKit
import ModelIO
import SceneKit.ModelIO
import GameEngineCore

#if os(iOS)
import UIKit
typealias PlatformColor = UIColor
#else
import AppKit
typealias PlatformColor = NSColor
#endif

/// GameOrchestrator - The main bridge between the C++ Engine and the Swift UI/Input layer.
/// This class manages the vertical loop: Input -> C++ Update -> Render Sync.
@MainActor
public class GameOrchestrator: ObservableObject {
    private var characterEngine: UnsafeMutablePointer<LegendsEngine.Character>?
    @Published public var scene = SCNScene()
    private var characterNode: SCNNode?
    private var lastUpdateTime: TimeInterval = 0
    
    public init() {
        setupScene()
    }
    
    private func setupScene() {
        // Add floor and lights
        let floorNode = SCNNode(geometry: SCNFloor())
        floorNode.geometry?.firstMaterial?.diffuse.contents = PlatformColor.darkGray
        scene.rootNode.addChildNode(floorNode)
        
        let lightNode = SCNNode()
        lightNode.light = SCNLight()
        lightNode.light?.type = .omni
        lightNode.position = SCNVector3(x: 0, y: 10, z: 10)
        scene.rootNode.addChildNode(lightNode)
    }
    
    private var animations: [LegendsEngine.AnimationState: SCNAnimationPlayer] = [:]
    private var currentState: LegendsEngine.AnimationState = .IDLE_CALM

    public func loadCharacter(id: String) {
        // 1. Create C++ engine instance
        characterEngine = LegendsEngine.CharacterFactory.CreateCharacter(std.string(id))
        
        // 2. Load 3D model
        guard let url = Bundle.module.url(forResource: id, withExtension: "glb") else {
            print("Failed to find model: \(id).glb")
            return
        }
        
        let asset = MDLAsset(url: url)
        let sceneModel = SCNScene(mdlAsset: asset)
        
        characterNode?.removeFromParentNode()
        characterNode = SCNNode()
        for child in sceneModel.rootNode.childNodes {
            characterNode?.addChildNode(child)
        }
        
        characterNode?.scale = SCNVector3(0.01, 0.01, 0.01) // Adjust based on model scale
        scene.rootNode.addChildNode(characterNode!)
        
        // 3. Discover Animations
        animations.removeAll()
        discoverAnimations(node: characterNode!)
        
        print("Loaded character model for \(id) with \(animations.count) mapped animations")
    }
    
    private func discoverAnimations(node: SCNNode) {
        // SceneKit animations can be on any node in the hierarchy
        for key in node.animationKeys {
            if let player = node.animationPlayer(forKey: key) {
                print("Found animation: \(key)")
                // Map based on key names (heuristic for now)
                mapAnimation(key: key, player: player)
            }
        }
        for child in node.childNodes {
            discoverAnimations(node: child)
        }
    }
    
    private func mapAnimation(key: String, player: SCNAnimationPlayer) {
        let lowerKey = key.lowercased()
        if lowerKey.contains("idle") { animations[.IDLE_CALM] = player }
        else if lowerKey.contains("walk") { animations[.WALK] = player }
        else if lowerKey.contains("run") { animations[.RUN] = player }
        else if lowerKey.contains("attack") || lowerKey.contains("combo") { animations[.LIGHT_COMBO] = player }
        else if lowerKey.contains("dodge") { animations[.DODGE_GROUND] = player }
    }
    
    public func startLoop() {
        #if os(iOS)
        let displayLink = CADisplayLink(target: self, selector: #selector(update))
        displayLink.add(to: .main, forMode: RunLoop.Mode.common)
        #else
        let timer = Timer.scheduledTimer(timeInterval: 1.0/60.0, target: self, selector: #selector(timerUpdate), userInfo: nil, repeats: true)
        RunLoop.main.add(timer, forMode: .common)
        #endif
        lastUpdateTime = CACurrentMediaTime()
    }
    
    #if !os(iOS)
    @objc private func timerUpdate() {
        self.update(displayLink: nil)
    }
    #endif
    
    @objc private func update(displayLink: Any?) {
        let currentTime = CACurrentMediaTime()
        let deltaTime = Float(currentTime - lastUpdateTime)
        lastUpdateTime = currentTime
        
        // 1. Process Input (stub for now)
        
        // 2. C++ Engine Update
        if let engine = characterEngine {
            engine.pointee.Update(deltaTime)
            
            // 3. Animation Sync
            let newState = engine.pointee.GetAnimationState()
            if newState != currentState {
                transitionTo(state: newState)
                currentState = newState
            }
            
            // 4. Render Sync: Map C++ state to SceneKit Node
            characterNode?.position = SCNVector3(engine.pointee.position.x, engine.pointee.position.y, engine.pointee.position.z)
        }
    }
    
    private func transitionTo(state: LegendsEngine.AnimationState) {
        // Stop current animation
        if let currentPlayer = animations[currentState] {
            currentPlayer.stop(withBlendOutDuration: 0.3)
        }
        
        // Play new animation
        if let newPlayer = animations[state] {
            newPlayer.play()
            print("Transitioned to animation state: \(state)")
        }
    }

    public func setInputAction(action: LegendsEngine.InputAction, state: Bool) {
        if let engine = characterEngine {
            engine.pointee.SetInputAction(action, state)
        }
    }

    public func performAction(state: LegendsEngine.AnimationState) {
        characterEngine?.pointee.SetAnimationState(state)
    }
}
