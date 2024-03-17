import * as THREE from 'three';
import { Experience, createExperience } from './Experience'
import Sizes from './Sizes'
import Camera from './Camera'
import { EffectComposer, SMAAPass } from 'three/examples/jsm/Addons.js'
import Renderer from './Renderer'

export const DEFAULT_RENDERER_CLEAR_COLOR = '#2e2e2e'

export default class Effect {
    experience: Experience | null
    canvas: HTMLCanvasElement
    renderer: Renderer
    sizes: Sizes
    scene: THREE.Scene
    camera: Camera
    instance: EffectComposer

    constructor() {
        this.experience = createExperience()
        this.canvas = this.experience.canvas
        this.renderer = this.experience.renderer
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        this.instance = this.setInstance()
    }

    private setInstance() {
        const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
            // samples: this.renderer.instance.getPixelRatio() === 1 ? 2 : 0,
        })

        const instance = new EffectComposer(this.renderer.instance, renderTarget)

        if (
            this.renderer.instance.getPixelRatio() === 1 &&
            !this.renderer.instance.capabilities.isWebGL2
        ) {
            const smaaPass = new SMAAPass(this.sizes.width, this.sizes.height)

            instance.addPass(smaaPass)
            console.log('Using SMAA')
        }

        this.instance = instance
        this.resize()
        return instance
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    update() {
        this.instance.render()
    }

    destroy() {
        this.instance.dispose()
    }
}
