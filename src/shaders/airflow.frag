#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_perlinTexture;
uniform int u_linesPerGroup;
uniform float u_lineFrequency;
uniform float u_lineAmplitude;
uniform float u_turbulentSpeed;
uniform float u_offsetSpeed;
uniform float u_flowSpeed;

const float overallSpeed = 0.2;
const float scale = 5.0;
const vec3 lineColor = vec3(1.0, 1.0, 1.0);
const float minLineWidth = 0.05;
const float maxLineWidth = 0.1;
const float offsetFrequency = 10.5;
const float minOffsetSpread = 0.6;
const float maxOffsetSpread = 1.0;

#define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))

float noise1d(float v){
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float random(float t)
{
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;   
}

float getPlasmaY(float x, float horizontalFade, float offset)   
{
    return random(x * u_lineFrequency + u_time * u_turbulentSpeed) * horizontalFade * u_lineAmplitude + offset;
}

void main(){
  vec2 uvCoord = vUv.yx;
  vec2 coord = uvCoord.xy * u_resolution;
  vec2 space = uvCoord;
  space.y = (coord.y - u_resolution.y / 2.0) / u_resolution.y * 2.0 * scale;

  float horizontalFade = 1.0 - (cos((uvCoord.x + u_time) * 2.0) * 0.5 + 0.5);
  float lines = 0.0;

  for(int i = 0; i < u_linesPerGroup; i++){
    float offsetTime = u_time * u_offsetSpeed;
    float offsetPosition = float(u_linesPerGroup / 2 - i);
    float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
    float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 1.0;
    float offset = random(offsetPosition + offsetTime) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
    float linePosition = getPlasmaY(uvCoord.x + float(i), 1.0, offsetPosition + offset / 2.0);
    float line = drawSmoothLine(linePosition, halfWidth, space.y);
    float verticalFade = 8.0 * smoothstep(
                                          0.0,
                                          0.1,
                                          abs(sin(((vUv.y + u_time * u_flowSpeed + float(i))))
                           ) * noise1d((vUv.y + u_time * u_flowSpeed + float(i)) * 0.0005));
    line *= verticalFade;
    lines += line;
  }

  float fadeInOut = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

  lines *= fadeInOut;
  gl_FragColor = vec4(lineColor, lines);
}