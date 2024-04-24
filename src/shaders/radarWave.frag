#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

void main(){
    // Transform the pixel coordinates to the center of the screen
    vec2 uv = (vUv.xy - 0.5 * vUv.xy) / vUv.y;

    float radius = length(vUv - vec2(0.5));
    radius -= u_time * 0.06;

    float ringPattern = step(sin(radius * 100.0), 0.9);

    vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.0), ringPattern);

    gl_FragColor = vec4(color, color);
}