#include <packing>

varying vec2 vUv;
varying vec2 vUv1;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;
uniform float offset;
uniform float vibration;

attribute float y;

float readDepth( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float PI = 3.1415925;

void main() {
    vUv = uv;

    // vec2 vUv1 = vec2(vUv.x, y);
    vec2 vUv1 = vec2(y, 1.0 - vUv.x);


    float depth = readDepth( tDepth, vUv1 );

    vec3 pos = position;

    depth = smoothstep(0.1, 1.0, depth);
    pos.z += (depth * offset - sin(y * PI) * vibration - sin(vUv.x * PI));
    // pos.z = smoothstep(0.0, 1.0, pos.z);
    // pos.z += depth;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}
