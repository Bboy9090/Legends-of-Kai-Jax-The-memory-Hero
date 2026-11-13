import { useGLTF } from "@react-three/drei";

// drei defaults to a gstatic CDN for the Draco decoder; keep every decoder local so no model path can need a network.
useGLTF.setDecoderPath("/draco/");
