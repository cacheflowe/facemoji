
/**
 *
 * This filter applies a pixlate effect making display objects appear 'blocky'
 * @class VignetteFilter
 * @contructor
 */
PIXI.VignetteFilter = function()
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        spread:  {type: '1f', value: Date.now()},
        darkness: {type: '1f', value: 1}
    };

    this.fragmentSrc = [
        'precision mediump float;',

        'uniform sampler2D uSampler;',
        'varying vec2 vTextureCoord;',
        'uniform float spread;',
        'uniform float darkness;',

        'void main() {',
        '    vec4 color = texture2D(uSampler, vTextureCoord);',
        '    float dist = distance( vTextureCoord, vec2( 0.5 ) );',
        '    color.rgb *= smoothstep( 0.8, spread * 0.799, dist *( darkness + spread ) );',
        '    gl_FragColor = color;',
        '}'
    ];
};

PIXI.VignetteFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.VignetteFilter.prototype.constructor = PIXI.VignetteFilter;


Object.defineProperty(PIXI.VignetteFilter.prototype, 'spread', {
    get: function() {
        return this.uniforms.spread.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.spread.value = value;
    }
});

Object.defineProperty(PIXI.VignetteFilter.prototype, 'darkness', {
    get: function() {
        return this.uniforms.darkness.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.darkness.value = value;
    }
});